export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-950/65 p-1" role="group" aria-label={ariaLabel}>
      {options.map((option) => <button type="button" key={option.value} onClick={() => onChange(option.value)} className={`min-h-9 rounded-lg px-3 text-xs font-bold transition-colors ${value === option.value ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:bg-white/8 hover:text-white'}`}>{option.label}</button>)}
    </div>
  );
}

export function Field({ label, children }) {
  return <div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500">{label}</span>{children}</div>;
}

export function Chip({ active, onClick, children, disabled }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`min-h-9 rounded-lg border px-3 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${active ? 'border-sky-400/60 bg-sky-400/15 text-sky-300' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'}`}>{children}</button>;
}

export function Select({ value, onChange, children, label }) {
  return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-9 rounded-lg border border-white/10 bg-slate-950 px-3 text-xs font-bold text-slate-200 outline-none focus:border-sky-500">{children}</select>;
}
