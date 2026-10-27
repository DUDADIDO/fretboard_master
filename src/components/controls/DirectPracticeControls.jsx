import { NoteTypePicker } from './GlobalControls.jsx';
import { Field, Section, Segmented } from './ControlPrimitives.jsx';

export default function DirectPracticeControls({ state }) {
  return (
    <div className="control-stack">
      <Section title="연습 방법">
        <Field label="출제 방식">
          <Segmented ariaLabel="기타 직접 연습 출제 방식" value={state.practice} onChange={state.setPractice} options={[{ value: 'RANDOM', label: '랜덤 1음' }, { value: 'ALL_ONCE', label: '전체 음 1회' }]} />
        </Field>
      </Section>
      <Section title="출제 범위">
        <Field label="출제 음 종류"><NoteTypePicker noteTypes={state.noteTypes} onChange={state.setNoteTypes} /></Field>
        <p className="text-xs leading-relaxed text-ink-soft">선택한 음 {state.noteCount}개 · C#과 Db는 따로 출제돼요 · 음 종류를 바꾸면 새 회차를 시작해요.</p>
      </Section>
    </div>
  );
}
