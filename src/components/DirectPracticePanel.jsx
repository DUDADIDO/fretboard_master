export default function DirectPracticePanel({ state, mic }) {
  return (
    <section className="flex h-full min-h-0 items-center justify-center overflow-y-auto card p-4" aria-label="기타 직접 연습 안내">
      <div className="text-center">
        <p className="text-[13px] font-bold text-brand">실제 기타로 연주하기</p>
        <p aria-live="polite" aria-atomic="true" className="my-3 text-7xl font-bold text-ink">{state.target}</p>
        <p className="mt-2 text-sm text-ink-soft">{mic?.listening ? '맞는 음을 치면 마이크가 듣고 자동으로 다음 음으로 넘어가요.' : '연주한 뒤 아래 버튼을 눌러 다음 음을 뽑습니다. 위의 마이크를 켜면 자동으로 넘어가요.'}</p>
        {mic?.listening && <p className="mt-2 text-sm font-bold tabular-nums text-brand">들린 음: {mic.heard ? `${mic.heard.name} (${mic.heard.cents > 0 ? '+' : ''}${mic.heard.cents}센트)` : '—'}</p>}
        <button type="button" onClick={state.next} className="btn btn-primary mt-4 min-h-12 px-8 text-base">{state.isLast ? '연주 완료 · 다음 회차' : '다음 음'}</button>
        <p className="mt-3 text-xs text-ink-soft">{state.isAllOnce ? `${state.noteCount}개 표기를 중복 없이 한 번씩 · 회차마다 새로 섞기` : '매번 무작위로 한 음 · 직전 표기 반복 없음'}</p>
      </div>
    </section>
  );
}
