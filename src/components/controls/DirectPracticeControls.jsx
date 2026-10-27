import { Chip, Field, Segmented } from './ControlPrimitives.jsx';

export default function DirectPracticeControls({ state }) {
  return (
    <div className="control-stack">
      <div className="flex flex-wrap items-center gap-3">
        <Field label="음 선택">
          {[['natural', '일반음'], ['sharp', '♯'], ['flat', '♭']].map(([key, label]) => (
            <Chip key={key} active={state.noteTypes[key]} onClick={() => state.toggleNoteType(key)}>{label} {state.noteTypes[key] ? 'ON' : 'OFF'}</Chip>
          ))}
        </Field>
        <Field label="출제 방식">
          <Segmented
            ariaLabel="기타 직접 연습 출제 방식"
            value={state.practice}
            onChange={state.setPractice}
            options={[{ value: 'RANDOM', label: '랜덤 1음' }, { value: 'ALL_ONCE', label: '전체 음 1회' }]}
          />
        </Field>
      </div>
      <div className="rounded-xl border border-sky-400/15 bg-sky-400/[0.06] px-3 py-2 text-xs leading-relaxed text-sky-100">
        선택한 음 총 {state.noteCount}개 · <span className="font-extrabold text-sky-300">C#과 Db는 별도 음으로 출제</span> · 음 선택을 바꾸면 새 회차 시작
      </div>
    </div>
  );
}
