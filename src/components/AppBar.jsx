import { useNavigate } from 'react-router-dom';
import { NAV_MODES } from '../constants/modes.js';

export default function AppBar({ navMode, mobile = false, onHelp, onSettings }) {
  const navigate = useNavigate();
  const change = (id) => navigate(`/practice/${id === 'notes' ? 'all' : id}`);
  return (
    <nav aria-label="연습 모드" className="card flex shrink-0 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
      {!mobile && <span className="mr-1 text-lg font-bold text-brand">Fretmaster</span>}
      <select aria-label="연습 모드" value={navMode.id} onChange={(event) => change(event.target.value)} className="min-h-10 min-w-0 flex-1 rounded-full border border-accent bg-white px-4 text-base font-semibold text-ink outline-none focus:ring-2 focus:ring-mint sm:max-w-72">
        {NAV_MODES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      {!mobile && <span className="hidden min-w-0 truncate text-sm text-ink-soft lg:block">{navMode.summary}</span>}
      <div className="ml-auto flex shrink-0 gap-2">
        <button type="button" onClick={onHelp} className="btn btn-outline">{mobile ? '?' : '사용법'}</button>
        <button type="button" onClick={onSettings} className="btn btn-primary">설정</button>
      </div>
    </nav>
  );
}
