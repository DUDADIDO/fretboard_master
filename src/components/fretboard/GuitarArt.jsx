import { GUITARS, NECK, NUT_X, STAGE, stringY } from './guitars.js';

// 기타 전체 그림(지판 제외). 지판은 이 위 NECK 영역에 HTML로 겹쳐 놓는다.
const STRINGS = [1, 2, 3, 4, 5, 6];
const STRING_WIDTH = [1, 1.5, 2, 2.7, 3.5, 4.2];
const STRING_COLOR = '#dfe3e8';

function BodyFill({ id, color }) {
  if (color.kind === 'burst') {
    const [center, mid, edge] = color.stops;
    return (
      <radialGradient id={id} cx=".68" cy=".5" r=".62">
        <stop offset="0" stopColor={center} /><stop offset=".5" stopColor={mid} /><stop offset=".86" stopColor={edge} /><stop offset="1" stopColor={edge} />
      </radialGradient>
    );
  }
  if (color.kind === 'metal') {
    const [dark, light, mid] = color.stops;
    return (
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={mid} /><stop offset=".3" stopColor={light} /><stop offset=".55" stopColor={dark} /><stop offset=".8" stopColor={light} /><stop offset="1" stopColor={mid} />
      </linearGradient>
    );
  }
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={color.base} /><stop offset="1" stopColor={color.base} />
    </linearGradient>
  );
}

function Humbucker({ x, cover, ring }) {
  const ys = STRINGS.map(stringY);
  return (
    <g>
      {ring && <rect x={x - 5} y={92} width={48} height={156} rx={6} fill={ring} stroke="rgba(0,0,0,.35)" />}
      {cover === 'open' ? (
        <>
          <rect x={x} y={98} width={18} height={144} rx={4} fill="#151515" stroke="rgba(255,255,255,.28)" />
          <rect x={x + 20} y={98} width={18} height={144} rx={4} fill="#151515" stroke="rgba(255,255,255,.28)" />
          {ys.map((y) => <circle key={y} cx={x + 9} cy={y} r={3.2} fill="url(#guitar-chrome)" />)}
          {ys.map((y) => <circle key={`s${y}`} cx={x + 29} cy={y} r={3.2} fill="#5a5f66" />)}
        </>
      ) : (
        <>
          <rect x={x} y={98} width={38} height={144} rx={5} fill="url(#guitar-chrome)" stroke="rgba(0,0,0,.4)" />
          {ys.map((y) => <circle key={y} cx={x + 10} cy={y} r={3} fill="#7d848c" />)}
          {ys.map((y) => <circle key={`s${y}`} cx={x + 28} cy={y} r={3} fill="#9aa1a8" />)}
        </>
      )}
    </g>
  );
}

function SingleCoil({ x }) {
  return (
    <g>
      <rect x={x} y={104} width={18} height={132} rx={9} fill="#f2efe7" stroke="rgba(0,0,0,.3)" />
      {STRINGS.map((string) => <circle key={string} cx={x + 9} cy={stringY(string)} r={2.8} fill="#9aa1a8" />)}
    </g>
  );
}

function Bridge({ bridge }) {
  const ys = STRINGS.map(stringY);
  if (bridge.type === 'tom') {
    return (
      <g>
        <rect x={bridge.x - 6} y={104} width={12} height={132} rx={4} fill="url(#guitar-chrome)" stroke="rgba(0,0,0,.4)" />
        {ys.map((y) => <rect key={y} x={bridge.x - 4} y={y - 4} width={8} height={8} rx={1.5} fill="#c9ced4" stroke="rgba(0,0,0,.35)" />)}
        <circle cx={bridge.x} cy={98} r={6} fill="url(#guitar-chrome)" stroke="rgba(0,0,0,.35)" />
        <circle cx={bridge.x} cy={242} r={6} fill="url(#guitar-chrome)" stroke="rgba(0,0,0,.35)" />
        <rect x={bridge.tail} y={108} width={14} height={124} rx={7} fill="url(#guitar-chrome)" stroke="rgba(0,0,0,.4)" />
        <circle cx={bridge.tail + 7} cy={112} r={6} fill="#b7bdc3" stroke="rgba(0,0,0,.35)" />
        <circle cx={bridge.tail + 7} cy={228} r={6} fill="#b7bdc3" stroke="rgba(0,0,0,.35)" />
      </g>
    );
  }
  return (
    <g>
      <rect x={bridge.x} y={100} width={40} height={140} rx={4} fill="url(#guitar-chrome)" stroke="rgba(0,0,0,.4)" />
      {ys.map((y) => <rect key={y} x={bridge.x + 4} y={y - 6} width={18} height={12} rx={2} fill="#c9ced4" stroke="rgba(0,0,0,.35)" />)}
      {[108, 136, 164, 192, 220].map((y) => <circle key={y} cx={bridge.x + 33} cy={y + 6} r={2.2} fill="#6b737b" />)}
    </g>
  );
}

const KNOB_FILL = { 'tophat-gold': 'url(#guitar-gold)', lampshade: 'url(#guitar-gold)', plastic: '#f2efe7', chrome: 'url(#guitar-chrome)' };

function Knobs({ knobs }) {
  return knobs.at.map(([x, y]) => (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={14} fill="rgba(0,0,0,.35)" transform="translate(1.5 2)" />
      <circle cx={x} cy={y} r={13} fill={KNOB_FILL[knobs.style]} stroke="rgba(0,0,0,.45)" />
      <circle cx={x} cy={y} r={knobs.style === 'tophat-gold' ? 7.5 : 8.5} fill="none" stroke="rgba(255,255,255,.45)" />
      <circle cx={x - 4} cy={y - 4} r={2.5} fill="rgba(255,255,255,.6)" />
    </g>
  ));
}

function Switch({ item }) {
  if (item.type === 'toggle') {
    return (
      <g>
        <circle cx={item.x} cy={item.y} r={13} fill="#efe6cf" stroke="rgba(0,0,0,.35)" />
        <circle cx={item.x} cy={item.y} r={5} fill="url(#guitar-chrome)" />
        <line x1={item.x} y1={item.y} x2={item.x + 9} y2={item.y - 9} stroke="#c9ced4" strokeWidth={3} strokeLinecap="round" />
        <circle cx={item.x + 10} cy={item.y - 10} r={4} fill="#efe6cf" stroke="rgba(0,0,0,.3)" />
      </g>
    );
  }
  return (
    <g>
      <rect x={item.x - 4} y={item.y - 16} width={8} height={32} rx={4} fill="#1a1a1a" />
      <rect x={item.x - 5} y={item.y - 6} width={10} height={12} rx={3} fill="#f2efe7" stroke="rgba(0,0,0,.3)" />
    </g>
  );
}

function Tuners({ tuners, headColor }) {
  const button = { tulip: '#efe6c8', oval: '#d2d7dc', inline: '#d2d7dc' }[tuners.button];
  return tuners.posts.map(([x, y], index) => (
    <g key={index}>
      <line x1={x} y1={y} x2={x} y2={tuners.buttons[index]} stroke="#a7aeb5" strokeWidth={4} />
      <ellipse cx={x} cy={tuners.buttons[index]} rx={tuners.button === 'tulip' ? 8 : 8} ry={tuners.button === 'tulip' ? 11 : 8} fill={button} stroke="rgba(0,0,0,.4)" />
      <circle cx={x} cy={y} r={7} fill={headColor === '#e2c088' ? '#c9ced4' : 'url(#guitar-chrome)'} stroke="rgba(0,0,0,.45)" />
      <circle cx={x} cy={y} r={2.8} fill="#4b5259" />
    </g>
  ));
}

export default function GuitarArt({ model, color: colorKey }) {
  const guitar = GUITARS[model] ?? GUITARS.lespaul;
  const color = guitar.colors[colorKey] ?? Object.values(guitar.colors)[0];
  const flame = color.flame || (guitar.flameAlways && color.kind === 'burst');
  const headFill = guitar.headColor === 'body' ? 'url(#guitar-body)' : guitar.headColor;
  const guard = guitar.pickguard && (guitar.pickguard.color ?? color.guard ?? '#f4f1ea');
  const ring = guitar.edge.binding && model === 'lespaul' ? '#efe6cf' : null;
  const tailEnd = guitar.bridge.type === 'tom' ? guitar.bridge.tail + 8 : guitar.bridge.x + 22;
  return (
    <svg className="guitar-art" viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} aria-hidden="true">
      <defs>
        <BodyFill id="guitar-body" color={color} />
        <linearGradient id="guitar-chrome" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a9098" /><stop offset=".35" stopColor="#f2f4f6" /><stop offset=".6" stopColor="#a7aeb5" /><stop offset="1" stopColor="#6b737b" />
        </linearGradient>
        <radialGradient id="guitar-gold" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffe6a0" /><stop offset=".5" stopColor="#d9a43a" /><stop offset="1" stopColor="#7a5414" />
        </radialGradient>
        <linearGradient id="guitar-gloss" x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" /><stop offset=".35" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* 플레임 메이플: 바디를 가로지르는 물결 무늬 */}
        <filter id="guitar-flame" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.004" numOctaves="3" seed="5" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="gray" />
          <feComponentTransfer in="gray" result="stripes"><feFuncR type="table" tableValues=".5 .8 1 .78 .5 .85 1" /><feFuncG type="table" tableValues=".5 .8 1 .78 .5 .85 1" /><feFuncB type="table" tableValues=".5 .8 1 .78 .5 .85 1" /></feComponentTransfer>
          <feComposite in="stripes" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="guitar-sparkle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  6 0 0 0 -4.1" result="specks" />
          <feComposite in="specks" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>

      {/* 바디 */}
      <g className="guitar-body">
        <path d={guitar.body} fill="url(#guitar-body)" />
        {flame && <path d={guitar.body} fill="#fff" filter="url(#guitar-flame)" style={{ mixBlendMode: 'multiply' }} opacity=".55" />}
        {color.sparkle && <path d={guitar.body} fill="#fff" filter="url(#guitar-sparkle)" opacity=".8" />}
        <path d={guitar.body} fill="url(#guitar-gloss)" />
        {guitar.edge.binding && <path d={guitar.body} fill="none" stroke={guitar.edge.binding} strokeWidth={guitar.edge.width} />}
        <path d={guitar.body} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth={1.2} />
      </g>
      {guitar.pickguard && <path d={guitar.pickguard.d} fill={guard} stroke="rgba(0,0,0,.35)" />}
      {guitar.pickups.map((pickup) => (pickup.type === 'single' ? <SingleCoil key={pickup.x} x={pickup.x} /> : <Humbucker key={pickup.x} x={pickup.x} cover={pickup.cover} ring={ring} />))}
      <Bridge bridge={guitar.bridge} />
      <Knobs knobs={guitar.knobs} />
      {guitar.switches.map((item) => <Switch key={`${item.x}-${item.y}`} item={item} />)}

      {/* 헤드 */}
      <path d={guitar.headstock} fill={headFill} />
      <path d={guitar.headstock} fill="url(#guitar-gloss)" />
      <path d={guitar.headstock} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth={1.2} />
      {guitar.trussRod && <path d="M160 156 C146 156 128 162 124 170 C128 178 146 184 160 184 Z" fill="#141414" stroke="#efe6cf" strokeWidth={1.5} />}
      <Tuners tuners={guitar.tuners} headColor={guitar.headColor} />

      {/* 지판 밖의 줄: 너트 → 줄감개, 지판 끝 → 브리지 */}
      {STRINGS.map((string, index) => {
        const [px, py] = guitar.tuners.posts[index];
        return (
          <g key={string}>
            <line x1={NUT_X} y1={stringY(string)} x2={px} y2={py} stroke={STRING_COLOR} strokeWidth={STRING_WIDTH[index]} vectorEffect="non-scaling-stroke" />
            <line x1={NECK.x1} y1={stringY(string)} x2={tailEnd} y2={stringY(string)} stroke={STRING_COLOR} strokeWidth={STRING_WIDTH[index]} vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.6))' }} />
          </g>
        );
      })}
    </svg>
  );
}
