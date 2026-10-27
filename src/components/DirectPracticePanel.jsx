export default function DirectPracticePanel({ state }) {
  return (
    <section className="flex h-full min-h-0 items-center justify-center overflow-y-auto rounded-2xl border border-white/8 bg-slate-900/55 p-4 shadow-xl shadow-black/10" aria-label="기타 직접 연습 안내">
      <div className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-sky-400">GUITAR PRACTICE</p>
        <p aria-live="polite" aria-atomic="true" className="my-3 text-7xl font-black text-white">{state.target}</p>
        <p className="mt-2 text-sm text-slate-500">연주한 뒤 아래 버튼을 눌러 다음 음을 뽑습니다.</p>
        <button type="button" onClick={state.next} className="mt-4 min-h-11 rounded-xl bg-sky-500 px-6 text-sm font-black text-slate-950 transition-colors hover:bg-sky-300">{state.isLast ? '연주 완료 · 다음 회차' : '다음 음'}</button>
        <p className="mt-3 text-xs text-slate-400">{state.isAllOnce ? `${state.noteCount}개 표기를 중복 없이 한 번씩 · 회차마다 새로 섞기` : '매번 무작위로 한 음 · 직전 표기 반복 없음'}</p>
      </div>
    </section>
  );
}
