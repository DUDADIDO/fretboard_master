import { Chip, Field } from './ControlPrimitives.jsx';

export default function GlobalControls({ noteTypes, setNoteTypes, showFrets, setShowFrets, keepMarks, setKeepMarks }) {
  const toggle = (key) => {
    const activeCount = Object.values(noteTypes).filter(Boolean).length;
    if (noteTypes[key] && activeCount === 1) return;
    setNoteTypes((current) => ({ ...current, [key]: !current[key] }));
  };
  return (
    <div className="flex flex-col gap-3">
      <Field label="음 선택">
        <Chip active={noteTypes.natural} onClick={() => toggle('natural')}>기본</Chip>
        <Chip active={noteTypes.sharp} onClick={() => toggle('sharp')}>♯</Chip>
        <Chip active={noteTypes.flat} onClick={() => toggle('flat')}>♭</Chip>
      </Field>
      <div className="flex flex-wrap gap-2"><Chip active={showFrets} onClick={() => setShowFrets((value) => !value)}>프렛 번호 {showFrets ? 'ON' : 'OFF'}</Chip>
      <Chip active={keepMarks} onClick={() => setKeepMarks((value) => !value)}>찾은 음 계속 표시 {keepMarks ? 'ON' : 'OFF'}</Chip></div>
    </div>
  );
}
