import { useNavigate } from 'react-router-dom';
import { NAV_MODES } from '../constants/modes.js';
import Dropdown from './controls/Dropdown.jsx';
import MicButton from './MicButton.jsx';

export default function AppBar({ navMode, mobile = false, mic = null, onHelp, onSettings }) {
  const navigate = useNavigate();
  const change = (id) => navigate(`/practice/${id === 'notes' ? 'all' : id}`);
  return (
    <nav aria-label="연습 모드" className="card flex shrink-0 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
      {!mobile && <span className="mr-1 text-xl font-extrabold tracking-[-0.03em] text-brand">Fretmaster</span>}
      <Dropdown label="연습 모드" size="lg" value={navMode.id} onChange={change} className="flex-1 sm:max-w-64 sm:flex-none sm:w-64">
        {NAV_MODES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </Dropdown>
      {!mobile && <span className="hidden min-w-0 truncate text-sm text-ink-soft lg:block">{navMode.summary}</span>}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {mic?.error && <span className="hidden max-w-72 text-xs leading-snug text-danger md:block">{mic.error}</span>}
        {mic && <MicButton mic={mic} mobile={mobile} />}
        <button type="button" onClick={onHelp} className="btn btn-outline">{mobile ? '?' : '사용법'}</button>
        <button type="button" onClick={onSettings} className="btn btn-primary">설정</button>
      </div>
    </nav>
  );
}
