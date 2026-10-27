import Dropdown from './Dropdown.jsx';

export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-[22px] bg-ceramic p-1" role="group" aria-label={ariaLabel}>
      {options.map((option) => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`min-h-9 rounded-full px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${value === option.value ? 'bg-accent text-white shadow-[0_0_.5px_rgba(0,0,0,.14),0_1px_1px_rgba(0,0,0,.24)]' : 'text-ink-soft hover:text-ink'}`}>{option.label}</button>)}
    </div>
  );
}

export function Field({ label, children }) {
  return <div className="flex flex-col items-start gap-2"><span className="text-[13px] font-semibold text-ink-soft">{label}</span><div className="flex flex-wrap items-center gap-2">{children}</div></div>;
}

export function Chip({ active, onClick, children, disabled }) {
  return <button type="button" aria-pressed={active} disabled={disabled} onClick={onClick} className={`min-h-9 rounded-full border px-4 text-[13px] font-semibold transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-accent bg-mint text-brand' : 'border-line bg-white text-ink-soft hover:border-ink-soft hover:text-ink'}`}>{children}</button>;
}

export function Select({ value, onChange, children, label, disabled = false }) {
  return <Dropdown label={label} value={value} onChange={onChange} disabled={disabled}>{children}</Dropdown>;
}
