import { NOTES, noteLabel } from '../../utils/notes.js';
import { Chip, Field, Segmented } from './ControlPrimitives.jsx';

export default function ThirdControls({ state }) {
  const toggleNote = (note) => state.setSelectedNotes((current) => current.includes(note) ? current.length === 1 ? current : current.filter((item) => item !== note) : [...current, note]);
  const toggleString = (string) => state.setSelectedStrings((current) => current.includes(string) ? current.length === 1 ? current : current.filter((item) => item !== string) : [...current, string]);
  return (
    <div className="control-stack">
      <div className="flex flex-wrap gap-3">
        <Field label="3도 종류"><Segmented ariaLabel="3도 종류" value={state.quality} onChange={state.setQuality} options={[{ value: 'MAJOR', label: '메이저 3도' }, { value: 'MINOR', label: '마이너 3도' }]} /></Field>
        <Field label="연습 방식"><Segmented ariaLabel="3도 연습 방식" value={state.practice} onChange={state.setPractice} options={[{ value: 'RANDOM', label: '랜덤' }, { value: 'FIXED_NOTE', label: '음 고정' }, { value: 'FIXED_STRING', label: '줄 고정' }, { value: 'FIXED_BOTH', label: '음+줄' }, { value: 'SEQ', label: '순차 전부' }]} /></Field>
      </div>
      {state.practice !== 'RANDOM' && <details className="settings-details"><summary>출제 범위 설정</summary><div className="mt-3 flex flex-wrap gap-3"><Field label="루트 음">{NOTES.map((note) => <Chip key={note} active={state.selectedNotes.includes(note)} onClick={() => toggleNote(note)}>{noteLabel(note)}</Chip>)}</Field><Field label="줄">{[6,5,4,3,2,1].map((string) => <Chip key={string} active={state.selectedStrings.includes(string)} onClick={() => toggleString(string)}>{string}</Chip>)}</Field></div></details>}
    </div>
  );
}
