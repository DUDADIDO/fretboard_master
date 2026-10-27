export default function QuizHeader({ eyebrow, target, description, status }) {
  return (
    <header className="quiz-header card grid min-h-[108px] grid-cols-[1fr_auto_1fr] items-center px-6 py-3 max-lg:min-h-[64px] max-lg:px-3 max-lg:py-1.5">
      <div className="min-w-0">
        <p className="text-[13px] font-bold tracking-[-0.01em] text-brand">{eyebrow}</p>
        <p className="mt-1 truncate text-sm text-ink-soft max-lg:text-xs">{description}</p>
      </div>
      <div className="min-w-[250px] px-5 text-center max-lg:min-w-[170px] max-lg:px-2">
        <div className="h-12 content-center whitespace-nowrap text-[34px] font-extrabold tracking-[-0.03em] text-ink max-lg:h-9 max-lg:text-xl">{target}</div>
      </div>
      <div className="justify-self-end text-right text-sm font-semibold tabular-nums text-ink-soft max-lg:text-xs">{status}</div>
    </header>
  );
}
