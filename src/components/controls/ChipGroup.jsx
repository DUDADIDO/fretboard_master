import { useRef, useState } from 'react';

const DRAG_THRESHOLD = 5;

// 여러 개를 고르는 칩 묶음. 칩 영역에서 끌면 스타크래프트처럼 선택 박스가 그려지고,
// 손을 떼면 박스에 걸린 칩들이 선택된다(Shift를 누르고 끌면 기존 선택에 더함). 클릭은 하나씩 켜고 끈다.
export default function ChipGroup({ options, value, onChange, label, min = 1, bulk = true }) {
  const areaRef = useRef(null);
  const drag = useRef(null);
  const [box, setBox] = useState(null);
  const [preview, setPreview] = useState(null);
  const order = (list) => options.map((option) => option.value).filter((item) => list.includes(item));

  const toggle = (target) => {
    const on = value.includes(target);
    if (on && value.length <= min) return;
    onChange(order(on ? value.filter((item) => item !== target) : [...value, target]));
  };

  const local = (event) => {
    const area = areaRef.current.getBoundingClientRect();
    return { x: event.clientX - area.left, y: event.clientY - area.top };
  };
  const hits = (rect) => {
    const area = areaRef.current.getBoundingClientRect();
    return [...areaRef.current.querySelectorAll('[data-chip]')].filter((chip) => {
      const r = chip.getBoundingClientRect();
      const left = r.left - area.left; const top = r.top - area.top;
      return left < rect.right && left + r.width > rect.left && top < rect.bottom && top + r.height > rect.top;
    }).map((chip) => options[Number(chip.dataset.chip)].value);
  };

  const down = (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    areaRef.current.setPointerCapture(event.pointerId);
    const chip = event.target.closest('[data-chip]');
    drag.current = { start: local(event), chip: chip ? options[Number(chip.dataset.chip)].value : null, add: event.shiftKey, moved: false };
  };
  const move = (event) => {
    const state = drag.current;
    if (!state) return;
    const point = local(event);
    if (!state.moved && Math.hypot(point.x - state.start.x, point.y - state.start.y) < DRAG_THRESHOLD) return;
    state.moved = true;
    const rect = { left: Math.min(state.start.x, point.x), top: Math.min(state.start.y, point.y), right: Math.max(state.start.x, point.x), bottom: Math.max(state.start.y, point.y) };
    setBox(rect);
    setPreview(hits(rect));
  };
  const up = () => {
    const state = drag.current;
    drag.current = null;
    if (!state) return;
    if (!state.moved) { if (state.chip != null) toggle(state.chip); return; }
    const inside = preview ?? [];
    setBox(null); setPreview(null);
    if (!inside.length) return;
    onChange(order(state.add ? [...new Set([...value, ...inside])] : inside));
  };
  const cancel = () => { drag.current = null; setBox(null); setPreview(null); };

  const all = options.map((option) => option.value);
  const inverted = all.filter((item) => !value.includes(item));
  return (
    <div className="flex w-full flex-col gap-2">
      <div ref={areaRef} role="group" aria-label={label} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}
        className="relative flex touch-none flex-wrap gap-1.5 rounded-xl bg-canvas/70 p-2 select-none">
        {options.map((option, index) => {
          const active = value.includes(option.value);
          const marked = preview?.includes(option.value);
          return (
            <button key={option.value} type="button" data-chip={index} aria-pressed={active}
              onClick={(event) => { if (event.detail === 0) toggle(option.value); }}
              className={`min-h-9 min-w-10 rounded-full border px-3.5 text-[13px] font-semibold transition-colors duration-150 ${active ? 'border-accent bg-accent text-white' : 'border-line bg-white text-ink-soft hover:border-ink-soft hover:text-ink'} ${marked ? 'ring-2 ring-accent ring-offset-2 ring-offset-canvas' : ''}`}>
              {option.label}
            </button>
          );
        })}
        {box && <span aria-hidden="true" className="selection-box" style={{ left: box.left, top: box.top, width: box.right - box.left, height: box.bottom - box.top }} />}
      </div>
      {bulk && (
        <div className="flex items-center gap-3 text-xs">
          <span className="tabular-nums text-ink-soft">{value.length}/{options.length} 선택</span>
          <button type="button" onClick={() => onChange(all)} disabled={value.length === all.length} className="font-semibold text-accent underline-offset-2 hover:underline disabled:text-ink-soft/50 disabled:no-underline">전체 선택</button>
          <button type="button" onClick={() => onChange(inverted)} disabled={inverted.length < min} className="font-semibold text-accent underline-offset-2 hover:underline disabled:text-ink-soft/50 disabled:no-underline">반전</button>
          <span className="ml-auto hidden text-ink-soft/70 sm:inline">끌어서 박스 선택 · Shift+끌기로 추가</span>
        </div>
      )}
    </div>
  );
}
