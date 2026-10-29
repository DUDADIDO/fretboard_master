import ChipGroup from './ChipGroup.jsx';
import { Field, Section, Segmented, Switch } from './ControlPrimitives.jsx';
import { INLAY_MATERIALS, INLAY_STYLES, WOODS } from '../fretboard/FretboardSkin.jsx';
import { THEMES } from '../../hooks/useTheme.js';
import { INSTRUMENTS } from '../../utils/guitarSound.js';

export const VIEWS = { AUTO: '자동', FULL: '전체', LOW: '0–12', MID: '5–17', HIGH: '12–24' };

const toOptions = (map) => Object.entries(map).map(([value, label]) => ({ value, label: typeof label === 'string' ? label : label.label }));

export const NOTE_TYPE_OPTIONS = [{ value: 'natural', label: '기본음' }, { value: 'sharp', label: '♯' }, { value: 'flat', label: '♭' }];

export function NoteTypePicker({ noteTypes, onChange }) {
  return (
    <ChipGroup label="출제 음 종류" bulk={false} options={NOTE_TYPE_OPTIONS}
      value={NOTE_TYPE_OPTIONS.map((option) => option.value).filter((key) => noteTypes[key])}
      onChange={(list) => onChange(Object.fromEntries(NOTE_TYPE_OPTIONS.map((option) => [option.value, list.includes(option.value)])))} />
  );
}

export default function GlobalControls({ noteTypes, setNoteTypes, showFrets, setShowFrets, keepMarks, setKeepMarks, soundOn, setSoundOn, instrument, setInstrument, skin, setSkin, theme, setTheme, view, setView }) {
  const setPart = (part) => (value) => setSkin((current) => ({ ...current, [part]: value }));
  // I자는 원래 금속 막대라 고르면 재질을 메탈로 맞춘다. 재질은 그 뒤에 바꿀 수 있다.
  const setInlay = (value) => setSkin((current) => ({ ...current, inlay: value, ...(value === 'bar' ? { material: 'metal' } : {}) }));
  return (
    <div className="control-stack">
      <Section title="음">
        <Field label="출제 음 종류"><NoteTypePicker noteTypes={noteTypes} onChange={setNoteTypes} /></Field>
      </Section>
      <Section title="화면 · 소리">
        <Field label="테마"><Segmented ariaLabel="화면 테마" value={theme} onChange={setTheme} options={toOptions(THEMES)} /></Field>
        <Switch label="찾은 음 계속 표시" description="끄면 실제 기타처럼 누른 음이 잠깐만 보여요" checked={keepMarks} onChange={setKeepMarks} />
        <Switch label="소리" description="지판을 누르면 그 음을 들려줘요" checked={soundOn} onChange={setSoundOn} />
        {soundOn && <Field label="악기 소리"><Segmented ariaLabel="악기 소리" value={instrument} onChange={setInstrument} options={toOptions(INSTRUMENTS)} /></Field>}
        <Switch label="프렛 번호" checked={showFrets} onChange={setShowFrets} />
      </Section>
      <Section title="지판">
        <Field label="보기 범위">
          <Segmented ariaLabel="지판 보기 범위" value={view} onChange={setView} options={toOptions(VIEWS)} />
          <p className="w-full text-xs leading-relaxed text-ink-soft">자동: 음 찾기는 0–12프렛, 펜타토닉은 지금 포지션만 크게 보여줘요. 휴대폰에서 칸이 커져 누르기 편해요.</p>
        </Field>
        <Field label="나무"><Segmented ariaLabel="지판 나무" value={skin.wood} onChange={setPart('wood')} options={toOptions(WOODS)} /></Field>
        <Field label="인레이"><Segmented ariaLabel="인레이 모양" value={skin.inlay} onChange={setInlay} options={toOptions(INLAY_STYLES)} /></Field>
        <Switch label="사이드 도트" description="넥 옆면 표시를 프렛 번호 위에 보여줘요" checked={skin.sideDots !== false} onChange={setPart('sideDots')} />
        {skin.inlay !== 'none' && <Field label="인레이 재질"><Segmented ariaLabel="인레이 재질" value={skin.material} onChange={setPart('material')} options={toOptions(INLAY_MATERIALS)} /></Field>}
      </Section>
    </div>
  );
}
