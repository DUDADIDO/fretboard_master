import { CHART_KEYS } from '../../utils/twoFiveOne.js';
import { Chip, Field, Segmented, Select } from './ControlPrimitives.jsx';

export default function TwoFiveOneControls({ state }) {
  return (
    <div className="control-stack">
      <div className="flex flex-wrap gap-3">
        <Field label="키 순서"><Segmented ariaLabel="키 진행 순서" value={state.keyOrder} onChange={state.setKeyOrder} options={[{ value: 'CHART', label: '차트 순서 (4도)' }, { value: 'FIXED', label: '한 키 반복' }, { value: 'RANDOM', label: '랜덤' }]} /></Field>
        <Field label="키"><Select label="ii-V-I 키" value={state.key} onChange={state.setKey}>{CHART_KEYS.map((key) => <option key={key} value={key}>{key} major</option>)}</Select></Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <Field label="코드톤"><Segmented ariaLabel="찾을 코드톤" value={state.toneSet} onChange={state.setToneSet} options={[{ value: 'ALL', label: '1 3 5 7 전체' }, { value: 'GUIDE', label: '가이드톤 3 · 7' }]} /></Field>
        <Field label="줄"><Select label="ii-V-I 줄" value={state.string} onChange={(value) => state.setString(Number(value))}><option value={0}>전체 줄</option>{[6, 5, 4, 3, 2, 1].map((string) => <option key={string} value={string}>{string}번줄</option>)}</Select></Field>
        <Chip active={state.showNames} onClick={() => state.setShowNames(!state.showNames)}>음이름 힌트</Chip>
      </div>
      <details className="settings-details"><summary>{state.key} 키 코드톤 표</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-ink-soft"><tr><th className="py-1">코드</th><th>근음</th><th>3음</th><th>5음</th><th>7음</th></tr></thead>
          <tbody>{state.progression.map((chord) => <tr key={chord.roman} className={chord.roman === state.chord.roman ? 'font-semibold text-brand' : 'text-ink'}><td className="py-1 font-bold">{chord.roman} {chord.symbol}</td>{chord.tones.map((tone) => <td key={tone.degree}>{tone.name} <span className="text-ink-soft">({tone.degree})</span></td>)}</tr>)}</tbody>
        </table>
      </details>
      <details className="settings-details"><summary>패턴 힌트</summary><p className="mt-2 text-ink">{state.hint}</p></details>
    </div>
  );
}
