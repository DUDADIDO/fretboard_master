// 지판 나무결과 인레이. 이미지 파일 없이 SVG 노이즈(feTurbulence)로 나무결을, SVG 도형으로 인레이를 그린다.

// table: 노이즈 밝기(0→1)를 나무 색으로 바꾸는 RGB 표. grain: [가로, 세로] 결 주파수(가로가 낮을수록 결이 길다).
// pores: 물관 점이 생기는 노이즈 문턱값(클수록 점이 많다).
export const WOODS = {
  rosewood: {
    label: '로즈우드', binding: '#e9dfc9',
    table: { r: '.06 .1 .2 .31 .22 .11 .07', g: '.04 .06 .12 .19 .13 .065 .045', b: '.03 .04 .08 .12 .085 .045 .03' },
    grain: '0.0012 0.07', pores: 0.3,
  },
  ebony: {
    label: '에보니', binding: '#e9dfc9',
    table: { r: '.035 .05 .07 .055 .04', g: '.033 .045 .06 .048 .036', b: '.032 .042 .055 .045 .034' },
    grain: '0.0015 0.09', pores: 0.28,
  },
  maple: {
    label: '메이플', binding: '#1c1714',
    table: { r: '.74 .84 .94 .88 .8', g: '.56 .68 .8 .73 .62', b: '.32 .43 .56 .49 .38' },
    grain: '0.001 0.05', pores: 0.2,
  },
  roasted: {
    label: '로스티드 메이플', binding: '#1c1714',
    table: { r: '.46 .55 .65 .58 .5', g: '.27 .34 .42 .37 .3', b: '.13 .17 .23 .2 .15' },
    grain: '0.0011 0.06', pores: 0.25,
  },
};

export const INLAY_STYLES = { dot: '도트', block: '블록', trapezoid: '사다리꼴', bar: 'I자', bird: '버드', none: '없음' };
export const INLAY_MATERIALS = { pearl: '자개', abalone: '아발론', metal: '메탈', black: '블랙' };

// 지판 전체를 덮는 나무결. viewBox 없이 실제 픽셀 크기로 그려서 결이 늘어나지 않는다.
export function WoodGrain({ wood }) {
  const spec = WOODS[wood] ?? WOODS.rosewood;
  return (
    <svg className="wood-layer" aria-hidden="true">
      <filter id={`wood-${wood}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {/* 긴 결: 가로로 길게 늘어난 노이즈를 흑백으로 만든 뒤 나무 색 표로 칠한다 */}
        <feTurbulence type="fractalNoise" baseFrequency={spec.grain} numOctaves="4" seed="11" result="grain" />
        <feColorMatrix in="grain" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="gray" />
        <feComponentTransfer in="gray" result="wood">
          <feFuncR type="table" tableValues={spec.table.r} />
          <feFuncG type="table" tableValues={spec.table.g} />
          <feFuncB type="table" tableValues={spec.table.b} />
        </feComponentTransfer>
        {/* 물관(작은 구멍): 촘촘한 노이즈의 어두운 부분만 검은 점으로 남겨 나무 위에 얹는다 */}
        <feTurbulence type="fractalNoise" baseFrequency="0.05 0.7" numOctaves="2" seed="4" result="poreNoise" />
        <feColorMatrix in="poreNoise" type="matrix" values={`0 0 0 0 .05  0 0 0 0 .03  0 0 0 0 .02  -9 0 0 0 ${9 * spec.pores}`} result="pores" />
        <feComposite in="pores" in2="wood" operator="over" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#wood-${wood})`} />
      {/* 위아래 가장자리가 둥글게 깎인 느낌의 음영 */}
      <rect width="100%" height="100%" fill="url(#wood-edge)" />
    </svg>
  );
}

// 인레이 재질. 한 번만 정의하고 모든 인레이 SVG가 id로 참조한다.
export function SkinDefs() {
  return (
    <svg className="skin-defs" aria-hidden="true" width="0" height="0">
      <defs>
        <linearGradient id="wood-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".08" stopColor="#000" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".04" />
          <stop offset=".92" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="inlay-pearl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4efe6" />
          <stop offset=".25" stopColor="#ddd4ec" />
          <stop offset=".5" stopColor="#d2ebe4" />
          <stop offset=".75" stopColor="#f0dcc0" />
          <stop offset="1" stopColor="#f7f4ee" />
        </linearGradient>
        <linearGradient id="inlay-abalone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f8f86" />
          <stop offset=".25" stopColor="#3a5fc2" />
          <stop offset=".45" stopColor="#7b4cc0" />
          <stop offset=".65" stopColor="#1aa37a" />
          <stop offset=".85" stopColor="#2f7fd0" />
          <stop offset="1" stopColor="#9fd8c4" />
        </linearGradient>
        {/* 헤어라인 알루미늄: 가운데 밝은 반사띠, 가장자리는 어둡게 */}
        <linearGradient id="inlay-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7b828a" />
          <stop offset=".35" stopColor="#d9dee3" />
          <stop offset=".5" stopColor="#f7f9fb" />
          <stop offset=".65" stopColor="#c3c9cf" />
          <stop offset="1" stopColor="#6f767e" />
        </linearGradient>
        <linearGradient id="inlay-black" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a2622" />
          <stop offset=".5" stopColor="#0d0b0a" />
          <stop offset="1" stopColor="#24201d" />
        </linearGradient>
        {/* 조개껍데기의 물결무늬: 노이즈로 밝기를 흔들어 색이 일렁이게 한다 */}
        <filter id="inlay-shimmer" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.22" numOctaves="3" seed="8" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0.7 0.5 0 0 0.15  0.2 0.8 0.3 0 0.1  0.5 0.2 0.7 0 0.12  0 0 0 0 1" result="tint" />
          <feBlend in="SourceGraphic" in2="tint" mode="overlay" result="mixed" />
          <feComposite in="mixed" in2="SourceAlpha" operator="in" />
        </filter>
        {/* 자개는 밝아서 overlay로는 하얗게 날아가므로, 옅은 무지갯빛 노이즈를 곱해 결을 낸다 */}
        <filter id="inlay-pearl-shimmer" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.22" numOctaves="3" seed="8" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0.9 0 -0.45 0 0.74  -0.35 0.9 0 0 0.68  0 -0.35 0.9 0 0.7  0 0 0 0 1" result="tint" />
          <feBlend in="SourceGraphic" in2="tint" mode="multiply" result="mixed" />
          <feComposite in="mixed" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

// 아래에서 올려다본 나는 새 실루엣. 머리가 위(y=0), 날개가 좌우로 펼쳐진 100×60 좌표로 그린 뒤
// 지판에서는 90° 돌려 머리가 바디 쪽(오른쪽), 날개가 줄을 가로지르게 놓는다.
const BIRD_SHAPES = {
  // 매: 넓은 날개 끝에 갈라진 깃, 부채꼴 꼬리
  hawk: 'M50 1 C53 1 55 4 55 8 C55 11 54 13 54.5 15 C62 13 76 11 88 12 C93 12.5 97 15 99 19 L93 20 L96 23 L90 23.5 L93 27 L86 27 L88 30.5 L80 29.5 C72 30 62 31 55 33 C55.5 37 55 40 54 42 L62 56 C56 59 44 59 38 56 L46 42 C45 40 44.5 37 45 33 C38 31 28 30 20 29.5 L12 30.5 L14 27 L7 27 L10 23.5 L4 23 L7 20 L1 19 C3 15 7 12.5 12 12 C24 11 38 13 45.5 15 C46 13 45 11 45 8 C45 4 47 1 50 1 Z',
  // 갈매기: 손목에서 꺾인 M자 날개, 쐐기 꼬리
  gull: 'M50 4 C53 4 54.5 7 54 11 C54 13 54 14 55 16 C62 12 68 8 74 9 C82 11 92 17 99 24 C90 22 82 21 76 20 C70 20 62 24 55 27 C55 32 54 36 53 40 L57 48 L50 46 L43 48 L47 40 C46 36 45 32 45 27 C38 24 30 20 24 20 C18 21 10 22 1 24 C8 17 18 11 26 9 C32 8 38 12 45 16 C46 14 46 13 46 11 C45.5 7 47 4 50 4 Z',
  // 제비: 뒤로 젖힌 뾰족한 날개, 갈라진 꼬리
  swallow: 'M50 3 C52.5 3 54 5.5 54 9 C54 11 54 12 54.5 14 C64 16 80 24 98 40 C84 34 68 28 55 27 C55 31 54 34 53 37 L60 58 L51 41 L49 41 L40 58 L47 37 C46 34 45 31 45 27 C32 28 16 34 2 40 C20 24 36 16 45.5 14 C46 12 46 11 46 9 C46 5.5 47.5 3 50 3 Z',
};

// 프렛마다 다른 새와 기울기(도). 같은 모양이 이어지지 않게 섞는다.
const BIRDS = [['hawk', -8], ['swallow', 6], ['gull', 10], ['hawk', 14], ['gull', -6], ['swallow', -12], ['hawk', 2], ['gull', 4], ['swallow', 10], ['hawk', -4]];
const fill = (material) => `url(#inlay-${material})`;
const filterFor = (material) => ({ pearl: 'url(#inlay-pearl-shimmer)', abalone: 'url(#inlay-shimmer)' }[material]);

export function Inlay({ shape, material, fret, index }) {
  if (shape === 'none') return null;
  const double = fret === 12 || fret === 24;
  // 도트와 I자(줄을 가로지르는 짧은 막대, 끝이 둥근 알약 모양)는 칸 폭과 상관없이 모양이 같아야 해서 HTML로 그린다.
  if (shape === 'dot') {
    const className = `inlay-dot inlay-${material}`;
    return double
      ? <><span className={className} style={{ top: '33.33%' }} /><span className={className} style={{ top: '66.67%' }} /></>
      : <span className={className} style={{ top: '50%' }} />;
  }
  // I자의 12·24프렛은 같은 길이 막대 두 개를 나란히(줄 방향으로 옆에) 놓는다.
  if (shape === 'bar') {
    const className = `inlay-bar inlay-${material}`;
    return double
      ? <><span className={className} style={{ left: 'calc(50% - 6px)' }} /><span className={className} style={{ left: 'calc(50% + 6px)' }} /></>
      : <span className={className} />;
  }
  const common = { fill: fill(material), filter: filterFor(material), stroke: 'rgba(0,0,0,.35)', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' };
  if (shape === 'bird') {
    const [kind, tilt] = BIRDS[index % BIRDS.length];
    return (
      <svg className="inlay-shape inlay-bird" viewBox="-8 -8 76 116" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path d={BIRD_SHAPES[kind]} transform={`rotate(${tilt} 30 50) translate(60 0) rotate(90)`} {...common} />
      </svg>
    );
  }
  // 블록·사다리꼴은 칸 크기에 맞춰 늘어나도 되는 도형이라 비율을 고정하지 않는다.
  const shapes = {
    block: <rect x="0" y="0" width="100" height="100" {...common} />,
    trapezoid: <polygon points="0,10 100,0 100,100 0,90" {...common} />,
  };
  return (
    <svg className={`inlay-shape inlay-${shape} ${double ? 'is-double' : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {shapes[shape]}
    </svg>
  );
}
