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

// 설정 패널 안의 묶음. 제목 아래에 항목을 세로로 쌓고 묶음끼리는 가는 선으로 나눈다.
export function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-4 border-t border-black/[0.06] pt-4 first:border-t-0 first:pt-0">
      <h4 className="text-xs font-bold tracking-[0.02em] text-brand">{title}</h4>
      {children}
    </section>
  );
}

// 켜고 끄는 설정. 글자 오른쪽에 스위치.
export function Switch({ checked, onChange, label, description }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 text-left">
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {description && <span className="text-xs text-ink-soft">{description}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-accent' : 'bg-line'}`}>
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.24)] transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}
