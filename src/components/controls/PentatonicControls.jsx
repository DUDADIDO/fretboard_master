import { NOTES, noteLabel } from '../../utils/notes.js';
import { Chip, Field, Segmented, Select } from './ControlPrimitives.jsx';

export default function PentatonicControls({ state }) {
  return (
    <div className="control-stack">
      <div className="flex flex-wrap gap-3">
        <Field label="중심음"><Select label="펜타토닉 중심음" value={state.root} onChange={state.setRoot}>{NOTES.map((note) => <option key={note} value={note}>{noteLabel(note)}</option>)}</Select><Segmented ariaLabel="펜타토닉 종류" value={state.quality} onChange={state.setQuality} options={[{ value: 'MAJOR', label: '메이저' }, { value: 'MINOR', label: '마이너' }]} /></Field>
        <Field label="출제"><Select label="펜타토닉 출제 방식" value={state.practice} onChange={state.setPractice}><option value="GUIDED">초심자 · 6→1</option><option value="STRING">줄별 반복</option><option value="RANDOM_STRING">랜덤 줄</option><option value="FULL">전체 테스트</option></Select></Field>
        <Field label="포지션"><Chip onClick={() => state.setPosition(state.position === 1 ? 5 : state.position - 1)}>←</Chip><span className="min-w-11 text-center text-sm font-black text-white">P{state.position}/5</span><Chip onClick={() => state.setPosition(state.position === 5 ? 1 : state.position + 1)}>→</Chip></Field>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={state.preview} onClick={() => state.setPreview((value) => !value)}>{state.preview ? '정답 숨기기' : '정답 보기'}</Chip>
        {state.practice !== 'FULL' && <Chip active={state.keepPrevious} onClick={() => state.setKeepPrevious((value) => !value)}>이전 줄 유지 {state.keepPrevious ? 'ON' : 'OFF'}</Chip>}
        {state.practice === 'GUIDED' && <Chip active={state.hint} disabled={state.preview || state.complete} onClick={() => state.setHint((value) => !value)}>힌트 {state.hint ? '숨기기' : '표시'}</Chip>}
        <Chip onClick={state.reset}>{state.complete ? '완료 · 다시하기' : '처음부터'}</Chip>
        <span className="text-xs text-slate-500">도수 {state.degrees}</span>
      </div>
    </div>
  );
}
