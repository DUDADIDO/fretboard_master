// 지판 양 끝: 왼쪽 헤드스톡(3+3 줄감개), 오른쪽 바디 일부와 넥 픽업.
// 모양은 칸 높이에 맞춰 늘어나도 되는 SVG(preserveAspectRatio="none")로, 줄감개처럼 둥글어야 하는 것은 HTML로 그린다.

export const FINISHES = {
  black: { label: '블랙', base: '#121212', light: '#3a3a3a' },
  white: { label: '화이트', base: '#e9e6df', light: '#ffffff' },
  pink: { label: '셸 핑크', base: '#e8b8bd', light: '#f8dde0' },
  blue: { label: '레이크 블루', base: '#2f6f9f', light: '#6aa6cf' },
  burst: { label: '선버스트', base: '#3a1608', light: '#e0a040', burst: true },
};

// 줄 y 위치(지판 안쪽 높이 기준 %). 인덱스 0 = 1번줄
const STRING_Y = [1, 2, 3, 4, 5, 6].map((string) => (string - 0.5) * (100 / 6));
const STRING_WIDTH = [1, 1.5, 2, 2.7, 3.5, 4.2]; // 지판 위 줄 굵기와 같게
// 줄감개 기둥(헤드스톡 안쪽 좌표 %): 1~3번줄은 위, 4~6번줄은 아래
const POSTS = [[78, 5], [52, 3], [26, 1], [26, 99], [52, 97], [78, 95]];

function Finish({ id, finish }) {
  const spec = FINISHES[finish] ?? FINISHES.black;
  return spec.burst ? (
    <radialGradient id={id} cx="1" cy=".5" r="1.1">
      <stop offset="0" stopColor={spec.light} /><stop offset=".45" stopColor="#b3561a" /><stop offset=".8" stopColor={spec.base} /><stop offset="1" stopColor="#120804" />
    </radialGradient>
  ) : (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={spec.base} /><stop offset=".22" stopColor={spec.light} /><stop offset=".35" stopColor={spec.base} /><stop offset="1" stopColor={spec.base} />
    </linearGradient>
  );
}

export function Headstock({ finish }) {
  return (
    <div className="headstock" aria-hidden="true">
      <svg className="end-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><Finish id="finish-head" finish={finish} /></defs>
        <path d="M100 0 L100 100 C82 104 58 110 30 111 C9 112 0 104 0 94 L0 6 C0 -4 9 -12 30 -11 C58 -10 82 -4 100 0 Z" fill="url(#finish-head)" stroke="rgba(0,0,0,.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* 줄과 줄감개는 지판 안쪽(바인딩 두께만큼 안)과 같은 높이 기준으로 맞춘다 */}
      <div className="end-inner">
        <svg className="end-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
          {STRING_Y.map((y, index) => <line key={index} x1="100" y1={y} x2={POSTS[index][0]} y2={POSTS[index][1]} stroke="#d9dee4" strokeWidth={STRING_WIDTH[index]} vectorEffect="non-scaling-stroke" />)}
        </svg>
        {POSTS.map(([x, y], index) => <span key={index} className="tuner-post" style={{ left: `${x}%`, top: `${y}%` }} />)}
      </div>
    </div>
  );
}

export function BodyEdge({ finish }) {
  return (
    <div className="body-edge" aria-hidden="true">
      <svg className="end-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><Finish id="finish-body" finish={finish} /></defs>
        {/* 넥이 바디에 붙는 곳: 위아래로 커지는 곡선(컷어웨이) */}
        <path d="M0 -60 C18 -40 22 -12 6 -2 L6 102 C22 112 18 140 0 160 L120 160 L120 -60 Z" fill="url(#finish-body)" stroke="rgba(0,0,0,.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="end-inner">
        <span className="pickup" />
        <svg className="end-shape" viewBox="0 0 100 100" preserveAspectRatio="none">
          {STRING_Y.map((y, index) => <line key={index} x1="0" y1={y} x2="100" y2={y} stroke="#d9dee4" strokeWidth={STRING_WIDTH[index]} vectorEffect="non-scaling-stroke" />)}
        </svg>
      </div>
    </div>
  );
}
