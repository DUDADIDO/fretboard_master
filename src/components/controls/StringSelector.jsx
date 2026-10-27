import ChipGroup from './ChipGroup.jsx';
import { Field, Segmented } from './ControlPrimitives.jsx';

const STRINGS = [6, 5, 4, 3, 2, 1];

export default function StringSelector({ mode, oneString, setOneString, multiStrings, setMultiStrings }) {
  if (mode === 'one') return <Field label="연습할 줄"><Segmented ariaLabel="연습할 줄" value={oneString} onChange={setOneString} options={STRINGS.map((string) => ({ value: string, label: `${string}번` }))} /></Field>;
  if (mode === 'multi') return <Field label="연습할 줄"><ChipGroup label="연습할 줄" value={multiStrings} onChange={setMultiStrings} options={STRINGS.map((string) => ({ value: string, label: `${string}번` }))} /></Field>;
  return null;
}
