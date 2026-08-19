import { NOTES, noteLabel } from '../../utils/notes.js';
import { Chip, Field, Segmented } from './ControlPrimitives.jsx';

export default function ChordToneControls({ state }) {
  const rootLocked = state.practice === 'RANDOM' || state.practice === 'FULL_SEQ';
  const stringLocked = state.practice !== 'DIRECT';
  return (
    <div className="control-stack">
      <div className="flex flex-wrap gap-3">
        <Field label="코드"><Segmented ariaLabel="코드 타입" value={state.quality} onChange={state.setQuality} options={[{ value: 'MAJ7', label: 'Maj7 · 1 3 5 7' }, { value: 'MIN7', label: 'm7 · 1 b3 5 b7' }, { value: 'DOM7', label: '7 · 1 3 5 b7' }]} /></Field>
        <Field label="진행"><Segmented ariaLabel="코드톤 진행 방식" value={state.practice} onChange={state.setPractice} options={[{ value: 'DIRECT', label: '직접 선택' }, { value: 'RANDOM', label: '무작위' }, { value: 'STRING_SEQ', label: '줄 순차' }, { value: 'FULL_SEQ', label: '전체 순차' }]} /></Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <Field label="루트">{NOTES.map((note) => <Chip key={note} disabled={rootLocked} active={state.root === note} onClick={() => state.setRoot(note)}>{noteLabel(note)}</Chip>)}</Field>
        <Field label="줄">{[6,5,4,3,2,1].map((string) => <Chip key={string} disabled={stringLocked} active={state.string === string} onClick={() => state.setString(string)}>{string}</Chip>)}</Field>
      </div>
      <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-xs leading-relaxed text-amber-100"><span className="font-extrabold text-amber-300">패턴 힌트</span> · {state.hint}<span className="ml-2 text-slate-400">정답은 위치가 아니라 실제 pitch class로 판정합니다.</span></div>
    </div>
  );
}
