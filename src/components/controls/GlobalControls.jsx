import ChipGroup from './ChipGroup.jsx';
import { Field, Section, Segmented, Switch } from './ControlPrimitives.jsx';
import { INLAY_MATERIALS, INLAY_STYLES, WOODS } from '../fretboard/FretboardSkin.jsx';
import { THEMES } from '../../hooks/useTheme.js';
import { firstColor, GUITARS } from '../fretboard/guitars.js';

// 색 견본: 선버스트는 가운데가 밝은 원, 메탈은 비스듬한 반사
const swatch = (color) => color.kind === 'burst' ? `radial-gradient(circle at 60% 50%, ${color.stops[0]}, ${color.stops[1]} 45%, ${color.stops[2]})`
  : color.kind === 'metal' ? `linear-gradient(135deg, ${color.stops[2]}, ${color.stops[1]} 40%, ${color.stops[0]})` : color.base;

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

export default function GlobalControls({ noteTypes, setNoteTypes, showFrets, setShowFrets, keepMarks, setKeepMarks, soundOn, setSoundOn, skin, setSkin, theme, setTheme, view, setView }) {
  const setPart = (part) => (value) => setSkin((current) => ({ ...current, [part]: value }));
  // I자는 원래 금속 막대라 고르면 재질을 메탈로 맞춘다. 재질은 그 뒤에 바꿀 수 있다.
  // 모델을 고르면 그 기타의 지판(나무·인레이)과 대표 색으로 맞춘다. 이후 따로 바꿀 수 있다.
  const setModel = (model) => setSkin((current) => ({ ...current, ...GUITARS[model].skin, model, color: firstColor(model) }));
  const model = GUITARS[skin.model] ? skin.model : 'lespaul';
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
        <Switch label="프렛 번호" checked={showFrets} onChange={setShowFrets} />
      </Section>
      <Section title="기타">
        <Switch label="기타 전체 보기" description="헤드부터 바디까지 기타 전체를 보여줘요. 지판 칸은 작아져요" checked={Boolean(skin.full)} onChange={(full) => setSkin((current) => ({ ...current, full, model: current.model ?? 'lespaul', color: current.color ?? firstColor(current.model ?? 'lespaul') }))} />
        <Field label="모델"><Segmented ariaLabel="기타 모델" value={model} onChange={setModel} options={Object.entries(GUITARS).map(([value, item]) => ({ value, label: item.label }))} /></Field>
        <Field label="색상">
          <div className="flex flex-wrap gap-2" role="group" aria-label="기타 색상">
            {Object.entries(GUITARS[model].colors).map(([value, color]) => {
              const active = (skin.color ?? firstColor(model)) === value;
              return (
                <button key={value} type="button" aria-pressed={active} onClick={() => setPart('color')(value)} title={color.label}
                  className={`flex min-h-9 items-center gap-2 rounded-full border py-1 pr-3.5 pl-1.5 text-[13px] font-semibold transition-colors ${active ? 'border-accent bg-mint text-brand' : 'border-line bg-surface text-ink-soft hover:text-ink'}`}>
                  <span className="size-6 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.25)]" style={{ background: swatch(color) }} />{color.label}
                </button>
              );
            })}
          </div>
        </Field>
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
