import { useEffect, useRef } from 'react';

// 여러 개를 고르는 칩 묶음. 누른 채로 다른 칩 위를 쭉 긁으면 같은 상태(켜기/끄기)로 한 번에 바뀐다.
// 첫 칩이 꺼져 있었으면 지나간 칩을 모두 켜고, 켜져 있었으면 모두 끈다. 최소 min개는 남긴다.
export default function ChipGroup({ options, value, onChange, label, min = 1, bulk = true }) {
  const groupRef = useRef(null);
  const drag = useRef(null);
  const order = (list) => options.map((option) => option.value).filter((item) => list.includes(item));

  const apply = (target, adding, current) => {
    if (adding === current.includes(target)) return current;
    if (!adding && current.length <= min) return current;
    return order(adding ? [...current, target] : current.filter((item) => item !== target));
  };

  useEffect(() => {
    const move = (event) => {
      const state = drag.current;
      if (!state) return;
      const chip = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-chip]');
      if (!chip || !groupRef.current?.contains(chip)) return;
      const target = options[Number(chip.dataset.chip)].value;
      if (state.visited.has(target)) return;
      state.visited.add(target);
      const next = apply(target, state.adding, state.value);
      if (next !== state.value) { state.value = next; onChange(next); }
    };
    const end = () => { drag.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); };
  });

  const start = (option) => (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const adding = !value.includes(option.value);
    const next = apply(option.value, adding, value);
    drag.current = { adding, value: next, visited: new Set([option.value]) };
    if (next !== value) onChange(next);
  };
  // 키보드(Enter/Space)로 누를 때만 click으로 처리한다. 마우스·터치는 pointerdown에서 처리.
  const keyToggle = (option) => (event) => {
    if (event.detail !== 0) return;
    const next = apply(option.value, !value.includes(option.value), value);
    if (next !== value) onChange(next);
  };

  const all = options.map((option) => option.value);
  const inverted = all.filter((item) => !value.includes(item));
  return (
    <div className="flex w-full flex-col gap-2">
      <div ref={groupRef} role="group" aria-label={label} className="flex flex-wrap gap-1.5 select-none">
        {options.map((option, index) => {
          const active = value.includes(option.value);
          return (
            <button key={option.value} type="button" data-chip={index} aria-pressed={active} onPointerDown={start(option)} onClick={keyToggle(option)}
              className={`min-h-9 min-w-10 touch-none rounded-full border px-3.5 text-[13px] font-semibold transition-colors duration-150 ${active ? 'border-accent bg-accent text-white' : 'border-line bg-white text-ink-soft hover:border-ink-soft hover:text-ink'}`}>
              {option.label}
            </button>
          );
        })}
      </div>
      {bulk && (
        <div className="flex items-center gap-3 text-xs">
          <span className="tabular-nums text-ink-soft">{value.length}/{options.length} 선택</span>
          <button type="button" onClick={() => onChange(all)} disabled={value.length === all.length} className="font-semibold text-accent underline-offset-2 hover:underline disabled:text-ink-soft/50 disabled:no-underline">전체 선택</button>
          <button type="button" onClick={() => onChange(inverted)} disabled={inverted.length < min} className="font-semibold text-accent underline-offset-2 hover:underline disabled:text-ink-soft/50 disabled:no-underline">반전</button>
          <span className="ml-auto hidden text-ink-soft/70 sm:inline">끌어서 여러 개 선택</span>
        </div>
      )}
    </div>
  );
}
