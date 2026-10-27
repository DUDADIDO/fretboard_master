import ChipGroup from './ChipGroup.jsx';
import { Field, Section, Switch } from './ControlPrimitives.jsx';

export const NOTE_TYPE_OPTIONS = [{ value: 'natural', label: '기본음' }, { value: 'sharp', label: '♯' }, { value: 'flat', label: '♭' }];

export function NoteTypePicker({ noteTypes, onChange }) {
  return (
    <ChipGroup label="출제 음 종류" bulk={false} options={NOTE_TYPE_OPTIONS}
      value={NOTE_TYPE_OPTIONS.map((option) => option.value).filter((key) => noteTypes[key])}
      onChange={(list) => onChange(Object.fromEntries(NOTE_TYPE_OPTIONS.map((option) => [option.value, list.includes(option.value)])))} />
  );
}

export default function GlobalControls({ noteTypes, setNoteTypes, showFrets, setShowFrets, keepMarks, setKeepMarks, soundOn, setSoundOn }) {
  return (
    <div className="control-stack">
      <Section title="음">
        <Field label="출제 음 종류"><NoteTypePicker noteTypes={noteTypes} onChange={setNoteTypes} /></Field>
      </Section>
      <Section title="화면 · 소리">
        <Switch label="찾은 음 계속 표시" description="끄면 실제 기타처럼 누른 음이 잠깐만 보여요" checked={keepMarks} onChange={setKeepMarks} />
        <Switch label="소리" description="지판을 누르면 그 음을 들려줘요" checked={soundOn} onChange={setSoundOn} />
        <Switch label="프렛 번호" checked={showFrets} onChange={setShowFrets} />
      </Section>
    </div>
  );
}
