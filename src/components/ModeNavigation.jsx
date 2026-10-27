import { useNavigate, useParams } from 'react-router-dom';
import { MODES } from '../constants/modes.js';

export default function ModeNavigation({ mobile = false }) {
  const navigate = useNavigate();
  const { mode: selectedMode } = useParams();
  return (
    <nav aria-label="연습 모드" className="flex shrink-0 items-center gap-1 rounded-xl border border-white/8 bg-slate-900/95 p-1.5">
      <label className="flex w-full items-center gap-3 px-1 text-sm font-bold text-sky-200 sm:w-auto">연습 모드
        <select value={selectedMode} onChange={(event) => navigate(`/practice/${event.target.value}`)} className="min-h-12 min-w-0 flex-1 rounded-xl border border-sky-400/50 bg-sky-950 px-4 text-lg font-bold text-white focus:outline-2 focus:outline-sky-400 sm:min-w-64">
          <optgroup label="실제 기타"><option value="direct">기타 직접 연습</option></optgroup>
          <optgroup label="지판 음 찾기">{MODES.filter((item) => ['all', 'one', 'multi', 'sequence'].includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>
          <optgroup label="이론과 패턴">{MODES.filter((item) => ['third', 'pentatonic', 'chord-tone', 'two-five-one'].includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>
        </select>
      </label>
      {!mobile && <span className="ml-auto px-3 text-xs font-black tracking-widest text-slate-500">FRETMASTER</span>}
    </nav>
  );
}
