export default function QuizHeader({ eyebrow, target, description, status }) {
  return (
    <header className="grid min-h-[108px] grid-cols-[1fr_auto_1fr] items-center rounded-2xl border border-white/8 bg-slate-900/75 px-5 py-3 shadow-xl shadow-black/10 max-lg:min-h-[64px] max-lg:px-3 max-lg:py-1.5">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-sky-400">{eyebrow}</p>
        <p className="mt-1 truncate text-sm text-slate-400 max-lg:text-xs">{description}</p>
      </div>
      <div className="min-w-[250px] px-5 text-center max-lg:min-w-[170px] max-lg:px-2">
        <div className="h-12 content-center whitespace-nowrap text-3xl font-black tracking-tight text-white max-lg:h-9 max-lg:text-xl">{target}</div>
      </div>
      <div className="justify-self-end text-right text-sm font-bold tabular-nums text-slate-300 max-lg:text-xs">{status}</div>
    </header>
  );
}
