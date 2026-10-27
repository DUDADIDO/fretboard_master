import { CHART_KEYS, POSITION_SHIFTS, SWEEP_DIRECTIONS } from '../../utils/twoFiveOne.js';
import { CHORD_ROMANS } from '../../features/twoFiveOne/useTwoFiveOnePractice.js';
import { Chip, Field, Segmented, Select } from './ControlPrimitives.jsx';

export default function TwoFiveOneControls({ state }) {
  return (
    <div className="control-stack">
      <Field label="연습 방식"><Segmented ariaLabel="ii-V-I 연습 방식" value={state.practice} onChange={state.setPractice} options={[{ value: 'SWEEP', label: '포지션 훑기' }, { value: 'STRING', label: '한 줄 1·3·5·7' }]} /></Field>
      {state.sweep && <div className="flex flex-wrap gap-3">
        <Field label="시작 위치 · 손 폭">
          <Select label="시작 프렛" value={state.rangeStart} onChange={(value) => state.moveStart(Number(value))}>{Array.from({ length: 22 }, (_, fret) => <option key={fret} value={fret}>{fret}프렛 근처 루트</option>)}</Select>
          <div className="flex gap-1">{[4, 5, 6].map((span) => <Chip key={span} active={state.width === span} onClick={() => state.setSpan(span)}>손 {span}칸</Chip>)}</div>
          <p className="w-full text-xs leading-relaxed text-ink-soft">루트에서 시작해 1→3→5→7→1… 순서로 이어 가요. 다음 음이 손가락 {state.width}칸 안에 없으면 손이 진행 방향으로 조금씩 옮겨 가요. 지판의 손 위치 표시를 끌어서 시작 위치를 바꿀 수도 있어요.</p>
        </Field>
        <Field label="포지션 이동">
          <Segmented ariaLabel="포지션 자동 이동" value={state.shift} onChange={state.setShift} options={Object.entries(POSITION_SHIFTS).map(([value, label]) => ({ value, label }))} />
          {state.shift !== 'OFF' && <Select label="이동 칸 수" value={state.shiftBy} onChange={(value) => state.setShiftBy(Number(value))}>{[1, 2, 3, 4, 5].map((step) => <option key={step} value={step}>{step}칸씩</option>)}</Select>}
          {state.shift !== 'OFF' && <p className="w-full text-xs text-ink-soft">지금 {state.position}–{state.lastFret}프렛 · 24프렛을 넘으면 처음 위치로 돌아와요.</p>}
        </Field>
        <Field label="방향"><Segmented ariaLabel="훑는 방향" value={state.direction} onChange={state.setDirection} options={Object.entries(SWEEP_DIRECTIONS).map(([value, label]) => ({ value, label }))} /></Field>
      </div>}
      <div className="flex flex-wrap gap-3">
        <Field label="키 순서"><Segmented ariaLabel="키 진행 순서" value={state.keyOrder} onChange={state.setKeyOrder} options={[{ value: 'CHART', label: '차트 순서 (4도)' }, { value: 'FIXED', label: '한 키 반복' }, { value: 'RANDOM', label: '랜덤' }]} /></Field>
        {state.keyOrder !== 'RANDOM' && <Field label={state.keyOrder === 'FIXED' ? '키' : '시작 키'}><Select label="ii-V-I 키" value={state.key} onChange={state.setKey}>{CHART_KEYS.filter((key) => !state.usesPool || state.keyPool.includes(key)).map((key) => <option key={key} value={key}>{key} major</option>)}</Select></Field>}
      </div>
      <Field label="출제 코드">
        {CHORD_ROMANS.map((roman) => {
          const item = state.progression.find((chord) => chord.roman === roman);
          return <Chip key={roman} active={state.chordFilter.includes(roman)} onClick={() => state.toggleChord(roman)}>{roman} · {item.suffix} ({item.symbol})</Chip>;
        })}
      </Field>
      {state.usesPool && <Field label={`출제 키 · ${state.keyPool.length}/12`}>
        {CHART_KEYS.map((key) => <Chip key={key} active={state.keyPool.includes(key)} onClick={() => state.toggleKey(key)}>{key}</Chip>)}
        <Chip active={false} onClick={() => state.setKeyPool(CHART_KEYS)}>전체</Chip>
      </Field>}
      <div className="flex flex-wrap gap-3">
        <Field label="코드톤"><Segmented ariaLabel="찾을 코드톤" value={state.toneSet} onChange={state.setToneSet} options={[{ value: 'ALL', label: '1 3 5 7 전체' }, { value: 'GUIDE', label: '루트 + 가이드톤 3 · 7' }]} /></Field>
        {!state.sweep && <Field label="줄"><Select label="ii-V-I 줄" value={state.string} onChange={(value) => state.setString(Number(value))}><option value={0}>전체 줄</option>{[6, 5, 4, 3, 2, 1].map((string) => <option key={string} value={string}>{string}번줄</option>)}</Select></Field>}
        <Chip active={state.showNames} onClick={() => state.setShowNames(!state.showNames)}>음이름 힌트</Chip>
      </div>
      <details className="settings-details"><summary>{state.key} 키 코드톤 표</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-ink-soft"><tr><th className="py-1">코드</th><th>근음</th><th>3음</th><th>5음</th><th>7음</th></tr></thead>
          <tbody>{state.progression.map((chord) => <tr key={chord.roman} className={chord.roman === state.chord.roman ? 'font-semibold text-brand' : 'text-ink'}><td className="py-1 font-bold">{chord.roman} {chord.symbol}</td>{chord.tones.map((tone) => <td key={tone.degree}>{tone.name} <span className="text-ink-soft">({tone.degree})</span></td>)}</tr>)}</tbody>
        </table>
      </details>
      {!state.sweep && <details className="settings-details"><summary>패턴 힌트</summary><p className="mt-2 text-ink">{state.hint}</p></details>}
    </div>
  );
}
