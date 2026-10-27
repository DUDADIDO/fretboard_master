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
      <div className="rounded-xl bg-canvas px-4 py-2.5 text-xs leading-relaxed text-ink-soft">
        선택한 음 총 {state.noteCount}개 · <span className="font-bold text-brand">C#과 Db는 별도 음으로 출제</span> · 음 선택을 바꾸면 새 회차 시작
      </div>
    </div>
  );
}
