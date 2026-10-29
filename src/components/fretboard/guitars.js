// 기타 전체 보기용 모델 데이터. 로고는 넣지 않는다.
// 좌표: 가로 1000 × 세로 340, 넥이 가로로 놓이고 헤드는 왼쪽, 바디는 오른쪽.
// 위쪽이 1번줄(고음) 쪽이라 실제 기타를 앞에서 본 모습을 위아래로 뒤집은 모양이다.
// 넥 폭은 지판을 누를 수 있게 실제보다 넓게(약 2.3배) 그린다.

export const STAGE = { width: 1000, height: 340 };
// 지판(개방현 칸 포함) 영역. 이 위에 실제로 누르는 지판을 겹쳐 놓는다.
export const NECK = { x0: 160, x1: 640, y0: 118, y1: 222 };
export const NUT_X = NECK.x0 + 0.032 * (NECK.x1 - NECK.x0);
export const stringY = (string) => NECK.y0 + ((string - 0.5) / 6) * (NECK.y1 - NECK.y0);

// 색: solid(단색), burst(가운데 밝고 가장자리 어두운 선버스트), metal(골드탑·실버), sparkle(펄 반짝이)
// flame: 플레임 메이플 무늬
const burst = (label, center, mid, edge, extra = {}) => ({ label, kind: 'burst', stops: [center, mid, edge], ...extra });
const solid = (label, base, extra = {}) => ({ label, kind: 'solid', base, ...extra });

export const GUITARS = {
  lespaul: {
    label: '레스폴',
    skin: { wood: 'rosewood', inlay: 'trapezoid', material: 'pearl' },
    body: 'M600 118 C590 106 574 98 568 84 C562 70 566 56 580 52 C610 44 640 40 670 44 C700 48 715 58 740 58 C770 58 800 8 872 6 C952 4 1000 80 1000 170 C1000 260 952 336 872 334 C800 332 770 282 740 282 C715 282 690 296 650 300 C600 304 560 280 548 240 L548 200 Z',
    edge: { binding: '#efe6cf', width: 4 },
    headstock: 'M175 118 C150 110 100 94 50 92 C26 91 8 96 6 104 C4 120 14 150 24 170 C14 190 4 220 6 236 C8 244 26 249 50 248 C100 246 150 230 175 222 Z',
    headColor: '#141414',
    tuners: { layout: '3+3', posts: [[55, 104], [95, 118], [138, 136], [138, 204], [95, 222], [55, 236]], buttons: [80, 84, 94, 246, 256, 260], button: 'tulip' },
    trussRod: true,
    pickguard: { d: 'M612 120 C618 96 640 80 672 76 C712 72 748 84 770 108 L774 120 Z', color: '#efe6cf' },
    pickups: [{ type: 'humbucker', x: 656, cover: 'chrome' }, { type: 'humbucker', x: 736, cover: 'chrome' }],
    bridge: { type: 'tom', x: 794, tail: 836 },
    knobs: { style: 'tophat-gold', at: [[850, 54], [905, 64], [872, 96], [928, 104]] },
    switches: [{ type: 'toggle', x: 612, y: 272 }],
    colors: {
      cherry: burst('헤리티지 체리 버스트', '#e3b25a', '#b8462a', '#5a0c10', { flame: true }),
      honey: burst('허니버스트', '#f0c870', '#d08a32', '#7a3a10', { flame: true }),
      tobacco: burst('타바코 버스트', '#d9a454', '#7a3c14', '#1c0c06', { flame: true }),
      goldtop: { label: '골드탑', kind: 'metal', stops: ['#8a6a24', '#e8cc78', '#b8923e'] },
      ebony: solid('에보니', '#111111'),
      white: solid('알파인 화이트', '#ece8de'),
      wine: solid('와인 레드', '#4e0d14'),
    },
  },
  prs: {
    label: 'PRS 커스텀 24',
    skin: { wood: 'rosewood', inlay: 'bird', material: 'pearl' },
    body: 'M610 118 C600 104 586 90 584 76 C582 60 592 50 606 52 C640 56 680 72 720 64 C760 56 790 14 870 12 C950 10 1000 80 1000 170 C1000 262 950 330 870 328 C790 326 760 286 720 278 C670 270 630 300 590 300 C560 300 546 292 550 276 C556 258 584 238 600 222 Z',
    edge: { binding: '#e8cf9c', width: 4 }, // 메이플 탑 가장자리의 내추럴 바인딩
    headstock: 'M175 118 C150 114 120 104 90 100 C60 96 30 92 14 100 C4 106 4 130 8 150 C12 170 8 200 6 222 C4 240 20 248 40 246 C80 242 140 232 175 222 Z',
    headColor: 'body',
    tuners: { layout: '3+3', posts: [[50, 102], [92, 116], [136, 134], [136, 206], [92, 224], [50, 236]], buttons: [82, 86, 96, 244, 254, 258], button: 'oval' },
    trussRod: true,
    pickups: [{ type: 'humbucker', x: 652, cover: 'open' }, { type: 'humbucker', x: 745, cover: 'open' }],
    bridge: { type: 'trem', x: 790 },
    knobs: { style: 'lampshade', at: [[848, 62], [898, 72]] },
    switches: [{ type: 'blade', x: 930, y: 104 }],
    flameAlways: true,
    colors: {
      whale: burst('페이디드 웨일 블루', '#7fb4d6', '#3b78a6', '#163652'),
      violet: burst('바이올렛', '#9a6ad0', '#5e2f9a', '#2a1048'),
      charcoal: burst('차콜 버스트', '#8a8a90', '#4a4a50', '#121214'),
      emerald: burst('에메랄드 그린', '#46b08a', '#137050', '#06301f'),
      fire: burst('파이어 레드 버스트', '#f6c060', '#e04628', '#5a0a08'),
      blackgold: burst('블랙 골드 버스트', '#e8bc56', '#9a6a1c', '#0e0a06'),
      purpleiris: burst('퍼플 아이리스', '#c07ad8', '#7a3aa8', '#30104a'),
    },
  },
  pacifica: {
    label: '퍼시피카',
    skin: { wood: 'rosewood', inlay: 'bar', material: 'pearl' },
    body: 'M612 118 C604 104 596 86 600 70 C604 52 618 40 636 44 C672 52 690 64 730 58 C780 50 800 6 880 8 C960 10 1000 90 994 170 C1000 252 962 334 880 332 C800 330 780 288 730 282 C690 278 640 304 590 306 C560 306 538 298 544 284 C550 266 580 240 596 222 Z',
    edge: { binding: null, width: 0 },
    headstock: 'M175 118 C150 121 110 126 60 132 C30 136 10 140 6 152 C2 166 10 196 22 224 C32 250 50 262 80 264 C110 266 140 260 160 246 C168 238 172 230 175 222 Z',
    headColor: '#e2c088', // 메이플 넥 그대로
    tuners: { layout: '6', posts: [[30, 222], [54, 232], [79, 236], [104, 236], [129, 234], [154, 228]], buttons: [276, 278, 280, 280, 278, 270], button: 'inline' },
    trussRod: false,
    pickguard: { d: 'M606 112 C600 92 608 72 632 68 C666 62 700 74 740 70 C784 66 818 46 862 48 C900 50 924 74 922 104 C920 122 904 130 884 128 C862 126 846 112 826 100 L802 100 L802 240 C800 266 784 284 750 290 C712 296 668 298 632 292 C604 286 594 262 602 232 Z' },
    pickups: [{ type: 'single', x: 656 }, { type: 'single', x: 712 }, { type: 'humbucker', x: 758, cover: 'open' }],
    bridge: { type: 'trem', x: 806 },
    knobs: { style: 'plastic', at: [[858, 70], [900, 90]] },
    switches: [{ type: 'blade', x: 818, y: 74 }],
    colors: {
      shellpink: solid('셸 핑크', '#e9b9be', { guard: '#f4f1ea' }),
      iceblue: solid('아이스 블루', '#b9d7e2', { guard: '#f4f1ea' }),
      sonicblue: solid('소닉 블루', '#86bcd6', { guard: '#f4f1ea' }),
      sparkleblue: solid('스파클 블루', '#1f4c9c', { sparkle: true, guard: '#141414' }),
      black: solid('블랙', '#121212', { guard: '#f4f1ea' }),
      white: solid('셸 화이트', '#eeeae0', { guard: '#141414' }),
      dusk: burst('데저트 더스크 버스트', '#e8a85a', '#b0542a', '#2a120a', { guard: '#141414' }),
    },
  },
  yamahasg: {
    label: '야마하 SG',
    skin: { wood: 'ebony', inlay: 'block', material: 'pearl' },
    body: 'M600 118 C590 104 572 92 564 72 C558 58 552 44 556 34 C560 26 576 26 592 32 C640 46 690 58 730 56 C780 54 800 12 880 10 C958 8 1000 80 1000 170 C1000 260 958 332 880 330 C800 328 780 286 730 284 C690 282 640 294 592 308 C576 314 560 314 556 306 C552 296 558 282 564 268 C572 248 590 236 600 222 Z',
    edge: { binding: '#efe6cf', width: 4 },
    headstock: 'M175 118 C150 110 100 96 60 90 C30 86 8 92 6 110 C4 130 10 150 8 170 C10 190 4 210 6 230 C8 248 30 254 60 250 C100 244 150 230 175 222 Z',
    headColor: '#141414',
    tuners: { layout: '3+3', posts: [[55, 102], [97, 116], [140, 134], [140, 206], [97, 224], [55, 238]], buttons: [76, 84, 94, 246, 256, 264], button: 'tulip' },
    trussRod: true,
    pickups: [{ type: 'humbucker', x: 656, cover: 'chrome' }, { type: 'humbucker', x: 736, cover: 'chrome' }],
    bridge: { type: 'tom', x: 794, tail: 836 },
    knobs: { style: 'chrome', at: [[852, 58], [906, 66], [874, 100], [928, 108]] },
    switches: [{ type: 'toggle', x: 640, y: 64 }],
    colors: {
      cherry: burst('체리 선버스트', '#e0a050', '#b03a22', '#4a0a0a', { flame: true }),
      brown: burst('브라운 선버스트', '#d9a454', '#8a4a1a', '#24100a', { flame: true }),
      black: solid('블랙', '#111111'),
      wine: solid('와인 레드', '#4e0d14'),
      silver: { label: '실버', kind: 'metal', stops: ['#7a7e84', '#e2e5e8', '#a9adb2'] },
    },
  },
};

export const firstColor = (model) => Object.keys(GUITARS[model].colors)[0];
