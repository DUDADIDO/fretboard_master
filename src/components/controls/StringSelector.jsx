import { Chip, Field } from './ControlPrimitives.jsx';

export default function StringSelector({ mode, oneString, setOneString, multiStrings, setMultiStrings }) {
  if (mode !== 'one' && mode !== 'multi') return null;
  const selected = mode === 'one' ? [oneString] : multiStrings;
  const toggle = (string) => {
    if (mode === 'one') return setOneString(string);
    if (multiStrings.includes(string) && multiStrings.length === 1) return;
    setMultiStrings((current) => current.includes(string) ? current.filter((item) => item !== string) : [...current, string]);
  };
  return (
    <Field label="연습할 줄">
      {[6, 5, 4, 3, 2, 1].map((string) => <Chip key={string} active={selected.includes(string)} onClick={() => toggle(string)}>{string}번</Chip>)}
      {mode === 'multi' && <><Chip active={multiStrings.length === 6} onClick={() => setMultiStrings([1, 2, 3, 4, 5, 6])}>전체</Chip><Chip active={false} onClick={() => setMultiStrings([6])}>초기화</Chip></>}
    </Field>
  );
}
