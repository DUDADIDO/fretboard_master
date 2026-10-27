import { useMemo, useRef } from 'react';
import { MAX_FRET } from '../../utils/fretboard.js';

// 지판 위 포지션 범위. 양쪽 경계를 끌면 범위가 늘고 줄고, 아래 막대를 끌면 범위째 옮겨진다.
export default function PositionRange({ ratios, start, end, onChange, resizable = true }) {
  const layerRef = useRef(null);
  const drag = useRef(null);
  // edges[i] = i번 프렛 칸의 왼쪽 경계(0~1). edges[MAX_FRET + 1] = 1
  const edges = useMemo(() => ratios.reduce((list, ratio) => [...list, list.at(-1) + ratio], [0]), [ratios]);

  const fraction = (event) => {
    const box = layerRef.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
  };
  const nearestEdge = (x) => edges.reduce((best, edge, index) => (Math.abs(edge - x) < Math.abs(edges[best] - x) ? index : best), 0);
  const fretAt = (x) => Math.min(MAX_FRET, Math.max(0, edges.findLastIndex((edge) => edge <= x)));

  const begin = (kind) => (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { kind, startFret: fretAt(fraction(event)), start, end };
  };
  const move = (event) => {
    const state = drag.current;
    if (!state) return;
    const x = fraction(event);
    let next = [state.start, state.end];
    if (state.kind === 'left') next = [Math.min(nearestEdge(x), state.end), state.end];
    else if (state.kind === 'right') next = [state.start, Math.max(nearestEdge(x) - 1, state.start)];
    else {
      const width = state.end - state.start;
      const moved = Math.min(MAX_FRET - width, Math.max(0, state.start + fretAt(x) - state.startFret));
      next = [moved, moved + width];
    }
    if (next[0] !== start || next[1] !== end) onChange(next[0], next[1]);
  };
  const finish = () => { drag.current = null; };
  const nudge = (kind) => (event) => {
    const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (!step) return;
    event.preventDefault();
    if (kind === 'left') onChange(Math.min(end, Math.max(0, start + step)), end);
    else if (kind === 'right') onChange(start, Math.max(start, Math.min(MAX_FRET, end + step)));
    else if (start + step >= 0 && end + step <= MAX_FRET) onChange(start + step, end + step);
  };

  const left = `${edges[start] * 100}%`;
  const width = `${(edges[end + 1] - edges[start]) * 100}%`;
  const handle = (kind, label) => ({
    role: 'slider', tabIndex: 0, 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': MAX_FRET,
    'aria-valuenow': kind === 'right' ? end : start,
    onPointerDown: begin(kind), onPointerMove: move, onPointerUp: finish, onPointerCancel: finish, onKeyDown: nudge(kind),
  });
  return (
    <div ref={layerRef} className="position-layer" aria-hidden="false">
      <div className="position-range" style={{ left, width }}>
        {resizable && <span className="position-handle left" {...handle('left', '포지션 시작 프렛')} title="끌어서 시작 프렛 조정" />}
        {resizable && <span className="position-handle right" {...handle('right', '포지션 끝 프렛')} title="끌어서 끝 프렛 조정" />}
        <span className="position-bar" {...handle('move', '포지션 옮기기')} title="끌어서 포지션 옮기기">손 {start}–{end}프렛 ⇆</span>
      </div>
    </div>
  );
}
