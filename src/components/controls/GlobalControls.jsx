import { Chip, Field } from './ControlPrimitives.jsx';

export default function GlobalControls({ noteTypes, setNoteTypes, showFrets, setShowFrets }) {
  const toggle = (key) => {
    const activeCount = Object.values(noteTypes).filter(Boolean).length;
    if (noteTypes[key] && activeCount === 1) return;
    setNoteTypes((current) => ({ ...current, [key]: !current[key] }));
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Field label="음 선택">
        <Chip active={noteTypes.natural} onClick={() => toggle('natural')}>기본</Chip>
        <Chip active={noteTypes.sharp} onClick={() => toggle('sharp')}>♯</Chip>
        <Chip active={noteTypes.flat} onClick={() => toggle('flat')}>♭</Chip>
      </Field>
      <Chip active={showFrets} onClick={() => setShowFrets((value) => !value)}>프렛 번호 {showFrets ? 'ON' : 'OFF'}</Chip>
    </div>
  );
}
