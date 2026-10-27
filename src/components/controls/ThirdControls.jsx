import { noteLabel, selectableNotes } from '../../utils/notes.js';
import ChipGroup from './ChipGroup.jsx';
import { Field, Section, Segmented, Select } from './ControlPrimitives.jsx';

export default function ThirdControls({ state, preference = 'BOTH' }) {
  // 루트 음 범위는 음 고정 방식에서만, 줄 범위는 모든 방식에서 쓰인다.
  const fixedNote = state.practice === 'FIXED_NOTE' || state.practice === 'FIXED_BOTH';
  return (
    <div className="control-stack">
      <Section title="연습 방법">
        <Field label="3도 종류"><Segmented ariaLabel="3도 종류" value={state.quality} onChange={state.setQuality} options={[{ value: 'MAJOR', label: '메이저 3도' }, { value: 'MINOR', label: '마이너 3도' }]} /></Field>
        <Field label="연습 방식"><Select label="3도 연습 방식" value={state.practice} onChange={state.setPractice}><option value="RANDOM">랜덤</option><option value="FIXED_NOTE">음 고정</option><option value="FIXED_STRING">줄 고정</option><option value="FIXED_BOTH">음+줄</option><option value="SEQ">순차 전부</option></Select></Field>
      </Section>
      <Section title="출제 범위">
          {fixedNote && <Field label="루트 음"><ChipGroup label="루트 음" value={state.selectedNotes} onChange={state.setSelectedNotes} options={selectableNotes(preference).map((note) => ({ value: note, label: noteLabel(note, preference) }))} /></Field>}
          <Field label="줄"><ChipGroup label="줄" value={state.selectedStrings} onChange={state.setSelectedStrings} options={[6, 5, 4, 3, 2, 1].map((string) => ({ value: string, label: `${string}번` }))} /></Field>
      </Section>
    </div>
  );
}
