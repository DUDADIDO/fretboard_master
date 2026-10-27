import { useNavigate, useParams } from 'react-router-dom';
import { MODES } from '../constants/modes.js';

export default function ModeNavigation({ mobile = false }) {
  const navigate = useNavigate();
  const { mode: selectedMode } = useParams();
  return (
    <nav aria-label="연습 모드" className="card flex shrink-0 items-center gap-3 px-4 py-2.5">
      {!mobile && <span className="text-lg font-bold text-brand">Fretmaster</span>}
      <label className="flex min-w-0 flex-1 items-center gap-3 text-sm font-semibold text-ink-soft sm:flex-none">연습 모드
        <select value={selectedMode} onChange={(event) => navigate(`/practice/${event.target.value}`)} className="min-h-10 min-w-0 flex-1 rounded-full border border-accent bg-white px-4 text-base font-semibold text-ink outline-none focus:ring-2 focus:ring-mint sm:min-w-64">
          <optgroup label="실제 기타"><option value="direct">기타 직접 연습</option></optgroup>
          <optgroup label="지판 음 찾기">{MODES.filter((item) => ['all', 'one', 'multi', 'sequence'].includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>
          <optgroup label="이론과 패턴">{MODES.filter((item) => ['third', 'pentatonic', 'chord-tone', 'two-five-one'].includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>
        </select>
      </label>
    </nav>
  );
}
