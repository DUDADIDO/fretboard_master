import { useNavigate } from 'react-router-dom';
import { NAV_MODES } from '../constants/modes.js';
import Overlay from './Overlay.jsx';

const STEPS = [
  ['모드 고르기', '맨 위 선택 상자에서 연습할 모드를 고르세요.'],
  ['지판 누르기', '가운데 나온 문제를 보고 지판의 칸을 누르세요. 맞으면 색이 칠해지고, 틀리면 잠깐 빨갛게 표시돼요.'],
  ['설정 바꾸기', '범위·줄·키·표시 방법은 오른쪽 위 [설정]에서 바꿀 수 있어요. 설정은 연습 도중에 바꿔도 돼요.'],
];

const LEGEND = [
  ['bg-[#006241]', '1 (루트)'],
  ['bg-[#b86e12]', '3도'],
  ['bg-[#2c6aa6]', '5도'],
  ['bg-[#7a3fa8]', '7도'],
  ['bg-danger', '틀린 위치'],
];

export default function HelpDialog({ open, onClose, navMode, firstVisit }) {
  const navigate = useNavigate();
  const pick = (id) => { navigate(`/practice/${id === 'notes' ? 'all' : id}`); onClose(); };
  return (
    <Overlay open={open} onClose={onClose} variant="dialog" title={firstVisit ? 'Fretmaster에 오신 걸 환영해요' : '사용법'}
      footer={<div className="flex justify-end"><button type="button" onClick={onClose} className="btn btn-primary min-h-11 px-6">{firstVisit ? '연습 시작하기' : '확인'}</button></div>}>
      <div className="flex flex-col gap-5 text-sm leading-relaxed text-ink">
        {firstVisit && <p className="text-ink-soft">기타 지판 위의 음, 3도, 펜타토닉, 코드톤을 화면을 눌러가며 익히는 연습 도구예요. 세 단계만 알면 바로 시작할 수 있어요.</p>}
        <ol className="flex flex-col gap-3">
          {STEPS.map(([title, body], index) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-[13px] font-bold text-white">{index + 1}</span>
              <p><span className="font-semibold">{title}</span> · <span className="text-ink-soft">{body}</span></p>
            </li>
          ))}
        </ol>

        <section className="rounded-xl bg-canvas p-4">
          <h3 className="font-semibold text-brand">지금 모드 · {navMode.label}</h3>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-ink-soft">{navMode.help.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>

        <section>
          <h3 className="font-semibold">색깔 뜻</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-ink-soft">{LEGEND.map(([color, label]) => <span key={label} className="flex items-center gap-1.5"><span className={`size-3.5 rounded-full ${color}`} />{label}</span>)}</div>
        </section>

        <section>
          <h3 className="font-semibold">모든 모드</h3>
          <ul className="mt-2 flex flex-col gap-1">
            {NAV_MODES.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => pick(item.id)} className={`w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-canvas ${item.id === navMode.id ? 'bg-mint/60' : ''}`}>
                  <span className="font-semibold">{item.label}</span> <span className="text-ink-soft">· {item.summary}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Overlay>
  );
}
