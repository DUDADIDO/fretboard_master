// 상단 바의 마이크 켜기/끄기. 켜져 있으면 지금 들리는 음과 소리 크기를 보여준다.
export default function MicButton({ mic, mobile }) {
  const label = mic.listening ? (mic.heard ? mic.heard.name : '듣는 중') : (mobile ? '' : '마이크');
  return (
    <button type="button" onClick={mic.toggle} aria-pressed={mic.listening} title={mic.error ?? (mic.listening ? '마이크 끄기' : '실제 기타 소리로 연습하기')}
      className={`btn ${mic.listening ? 'btn-primary' : 'btn-outline'} relative overflow-hidden tabular-nums`}>
      {mic.listening && <span aria-hidden="true" className="absolute inset-y-0 left-0 bg-white/25 transition-[width] duration-75" style={{ width: `${mic.level * 100}%` }} />}
      <svg aria-hidden="true" viewBox="0 0 20 20" className="relative size-4"><path d="M10 2.5a2.5 2.5 0 0 0-2.5 2.5v5a2.5 2.5 0 0 0 5 0V5A2.5 2.5 0 0 0 10 2.5ZM5 9.5a5 5 0 0 0 10 0M10 14.5v3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
      {label && <span className="relative min-w-[2.5ch]">{label}</span>}
    </button>
  );
}
