import { noteLabel, selectableNotes } from '../../utils/notes.js';
import { Field, Section, Segmented, Select } from './ControlPrimitives.jsx';

export default function ChordToneControls({ state, preference = 'BOTH' }) {
  const rootLocked = state.practice === 'RANDOM' || state.practice === 'RANDOM_SEQ' || state.practice === 'FULL_SEQ';
  const stringLocked = state.practice !== 'DIRECT';
  return (
    <div className="control-stack">
      <Section title="연습 방법">
      <div className="flex flex-wrap gap-3">
        <Field label="코드"><Segmented ariaLabel="코드 타입" value={state.quality} onChange={state.setQuality} options={[{ value: 'MAJ7', label: 'Maj7 · 1 3 5 7' }, { value: 'MIN7', label: 'm7 · 1 b3 5 b7' }, { value: 'DOM7', label: '7 · 1 3 5 b7' }]} /></Field>
        <Field label="진행"><Select label="코드톤 진행 방식" value={state.practice} onChange={state.setPractice}><option value="DIRECT">직접 선택</option><option value="RANDOM">무작위 음·줄</option><option value="STRING_SEQ">줄 순차</option><option value="RANDOM_SEQ">랜덤 음 · 6→1</option><option value="FULL_SEQ">전체 순차</option></Select></Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <Field label="루트">{rootLocked ? <span className="text-sm font-semibold text-brand">{noteLabel(state.root, preference)} · 자동</span> : <Select label="코드톤 루트" value={state.root} onChange={state.setRoot}>{selectableNotes(preference).map((note) => <option key={note} value={note}>{noteLabel(note, preference)}</option>)}</Select>}</Field>
        <Field label="줄">{stringLocked ? <span className="text-sm font-semibold text-brand">{state.string}번 · 자동</span> : <Select label="코드톤 줄" value={state.string} onChange={(value) => state.setString(Number(value))}>{[6,5,4,3,2,1].map((string) => <option key={string} value={string}>{string}번줄</option>)}</Select>}</Field>
      </div>
      </Section>
      <Section title="도움">
      <details className="settings-details"><summary>패턴 힌트</summary><p className="mt-2 text-ink">{state.hint}</p></details>
      </Section>
    </div>
  );
}
