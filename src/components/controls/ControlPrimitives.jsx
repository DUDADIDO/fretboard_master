export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full bg-ceramic p-1" role="group" aria-label={ariaLabel}>
      {options.map((option) => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`min-h-9 rounded-full px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${value === option.value ? 'bg-accent text-white shadow-[0_0_.5px_rgba(0,0,0,.14),0_1px_1px_rgba(0,0,0,.24)]' : 'text-ink-soft hover:text-ink'}`}>{option.label}</button>)}
    </div>
  );
}

export function Field({ label, children }) {
  return <div className="flex flex-wrap items-center gap-2"><span className="min-w-14 text-[13px] font-bold text-ink-soft">{label}</span>{children}</div>;
}

export function Chip({ active, onClick, children, disabled }) {
  return <button type="button" aria-pressed={active} disabled={disabled} onClick={onClick} className={`min-h-9 rounded-full border px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-accent bg-mint text-brand' : 'border-line bg-white text-ink-soft hover:border-ink-soft hover:text-ink'}`}>{children}</button>;
}

export function Select({ value, onChange, children, label, disabled = false }) {
  return <select aria-label={label} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-9 rounded border border-line bg-white px-3 text-[13px] font-semibold text-ink outline-none focus:border-accent disabled:opacity-40">{children}</select>;
}
