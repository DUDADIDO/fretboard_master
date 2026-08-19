import { NavLink } from 'react-router-dom';
import { MODES } from '../constants/modes.js';

export default function ModeNavigation({ mobile = false }) {
  return (
    <nav aria-label="연습 모드" className={mobile ? 'grid grid-cols-7 gap-1 rounded-xl border border-white/8 bg-slate-900/95 p-1' : 'flex gap-1 overflow-x-auto rounded-2xl border border-white/8 bg-slate-900/85 p-1.5 shadow-2xl shadow-black/20'}>
      {!mobile && <div className="mr-2 flex shrink-0 items-center gap-2 border-r border-white/8 px-2 pr-4" aria-label="Fretmaster"><span className="grid size-8 place-items-center rounded-lg bg-sky-500 text-[11px] font-black text-slate-950 shadow-lg shadow-sky-500/15">FM</span><span className="text-[11px] font-black tracking-[0.16em] text-slate-300">FRETMASTER</span></div>}
      {MODES.map((mode) => (
        <NavLink key={mode.id} to={`/practice/${mode.id}`} className={({ isActive }) => `whitespace-nowrap rounded-xl font-bold transition-colors ${mobile ? 'px-1 py-2 text-center text-[10px]' : 'px-4 py-2.5 text-sm'} ${isActive ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:bg-white/6 hover:text-white'}`}>
          {mobile ? mode.short : mode.label}
        </NavLink>
      ))}
    </nav>
  );
}
