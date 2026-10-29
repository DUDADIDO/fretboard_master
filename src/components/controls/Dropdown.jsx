import { Children, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

// 브라우저 기본 select 목록 대신 사이트 스타일로 그리는 드롭다운.
// <option> 자식을 그대로 받아서 기존 Select 사용처를 바꾸지 않아도 된다.
function readOptions(children) {
  return Children.toArray(children).filter((child) => child?.type === 'option').map((child) => ({
    value: String(child.props.value),
    label: Children.toArray(child.props.children).join(''),
  }));
}

export default function Dropdown({ value, onChange, children, label, disabled = false, size = 'md', className = '' }) {
  const options = readOptions(children);
  const current = options.find((option) => option.value === String(value)) ?? options[0];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const place = useCallback(() => {
    const box = buttonRef.current?.getBoundingClientRect();
    if (!box) return;
    const below = window.innerHeight - box.bottom;
    const height = Math.min(320, options.length * 40 + 12);
    const up = below < height + 12 && box.top > below;
    setRect({ left: box.left, width: Math.max(box.width, 160), top: up ? undefined : box.bottom + 6, bottom: up ? window.innerHeight - box.top + 6 : undefined, maxHeight: Math.max(160, (up ? box.top : below) - 18) });
  }, [options.length]);

  const show = () => { if (disabled) return; place(); setActive(Math.max(0, options.indexOf(current))); setOpen(true); };
  const close = (focus = true) => { setOpen(false); if (focus) buttonRef.current?.focus(); };
  const choose = (option) => { if (option.value !== current?.value) onChange(option.value); close(); };

  useLayoutEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => { if (!buttonRef.current?.contains(event.target) && !listRef.current?.contains(event.target)) close(false); };
    const onMove = (event) => { if (!listRef.current?.contains(event.target)) close(false); };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => { window.removeEventListener('pointerdown', onDown); window.removeEventListener('scroll', onMove, true); window.removeEventListener('resize', onMove); };
  }, [open]);

  const onListKey = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((index) => Math.min(options.length - 1, index + 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((index) => Math.max(0, index - 1)); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(options.length - 1); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(options[active]); }
    else if (event.key === 'Escape' || event.key === 'Tab') { event.preventDefault(); event.stopPropagation(); close(); }
  };
  useEffect(() => { if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' }); }, [active, open]);

  const large = size === 'lg';
  return (
    <>
      <button ref={buttonRef} type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} disabled={disabled}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => { if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); show(); } }}
        className={`group inline-flex min-w-0 items-center justify-between gap-3 rounded-full border bg-surface text-left font-semibold text-ink outline-none transition-all duration-200 active:scale-[.98] focus-visible:ring-2 focus-visible:ring-mint disabled:cursor-not-allowed disabled:opacity-40 ${open ? 'border-accent' : 'border-line hover:border-ink-soft'} ${large ? 'min-h-11 pr-4 pl-5 text-[15px]' : 'min-h-9 pr-3 pl-4 text-[13px]'} ${className}`}>
        <span className="truncate">{current?.label}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? 'rotate-180 text-accent' : ''} ${large ? 'size-5' : 'size-4'}`}><path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && rect && (
        <ul ref={listRef} id={listId} role="listbox" aria-label={label} tabIndex={-1} onKeyDown={onListKey}
          aria-activedescendant={`${listId}-${active}`}
          style={{ position: 'fixed', left: rect.left, top: rect.top, bottom: rect.bottom, minWidth: rect.width, maxHeight: rect.maxHeight }}
          className="dropdown-menu z-50 overflow-y-auto rounded-xl bg-surface p-1.5 outline-none">
          {options.map((option, index) => {
            const selected = option.value === current?.value;
            return (
              <li key={option.value} id={`${listId}-${index}`} role="option" aria-selected={selected}
                onPointerEnter={() => setActive(index)} onClick={() => choose(option)}
                className={`flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 text-sm ${index === active ? 'bg-canvas' : ''} ${selected ? 'font-semibold text-brand' : 'text-ink'}`}>
                <span className="whitespace-nowrap">{option.label}</span>
                {selected && <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 shrink-0 text-accent"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
