import { NOTES } from './notes.js';

// 차트(II-V-I in 12 Major Keys)와 같은 순서·표기. 4도씩 이동한다.
export const CHART_KEYS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'];

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];

// 도수 → [글자 간격, 반음]. 글자 기준으로 철자를 맞춰 Gb 키에서 B 대신 Cb을 쓴다.
const DEGREES = { 1: [0, 0], 2: [1, 2], 3: [2, 4], b3: [2, 3], 4: [3, 5], 5: [4, 7], 6: [5, 9], 7: [6, 11], b7: [6, 10] };

export const TWO_FIVE_ONE_CHORDS = [
  { roman: 'ii', degree: 2, quality: 'MIN7', suffix: 'm7', degrees: ['1', 'b3', '5', 'b7'] },
  { roman: 'V', degree: 5, quality: 'DOM7', suffix: '7', degrees: ['1', '3', '5', 'b7'] },
  { roman: 'I', degree: 1, quality: 'MAJ7', suffix: 'Δ7', degrees: ['1', '3', '5', '7'] },
];

export const GUIDE_DEGREES = ['b3', '3', 'b7', '7'];

function parseNote(name) {
  const letter = LETTERS.indexOf(name[0]);
  const accidentals = name.slice(1);
  const offset = [...accidentals].reduce((sum, char) => sum + (char === '#' ? 1 : char === 'b' ? -1 : 0), 0);
  return { letter, pc: (NATURAL_PC[letter] + offset + 12) % 12 };
}

export function spellDegree(root, degree) {
  const [steps, semitones] = DEGREES[degree];
  const { letter, pc } = parseNote(root);
  const targetLetter = (letter + steps) % 7;
  const targetPc = (pc + semitones) % 12;
  const diff = ((targetPc - NATURAL_PC[targetLetter] + 18) % 12) - 6;
  return LETTERS[targetLetter] + (diff > 0 ? '#'.repeat(diff) : 'b'.repeat(-diff));
}

// 철자 표기(Cb, E# 등)를 지판 매칭용 샵 기준 pitch class 이름으로 바꾼다.
export function pitchName(name) {
  return NOTES[parseNote(name).pc];
}

export function getTwoFiveOne(key) {
  return TWO_FIVE_ONE_CHORDS.map((chord) => {
    const root = spellDegree(key, chord.degree);
    return {
      ...chord,
      root,
      symbol: `${root}${chord.suffix}`,
      tones: chord.degrees.map((degree) => {
        const name = spellDegree(root, degree);
        return { degree, name, note: pitchName(name) };
      }),
    };
  });
}

// 코드마다 새 포지션이라 항상 6번줄 루트에서 시작한다.
export const SWEEP_DIRECTIONS = { UP: '6→1 상행', UPDOWN: '6→1→6 왕복' };

export const POSITION_SHIFTS = { OFF: '고정', KEY: '키마다 위로', CYCLE: '한 바퀴 돌면 위로' };

// 포지션을 shiftBy칸 위로 옮긴 오프셋. 범위 끝이 maxFret을 넘으면 처음 위치(오프셋 0)로 돌아온다.
export function nextPositionOffset(offset, shiftBy, rangeEnd, maxFret = 24) {
  const next = offset + shiftBy;
  return rangeEnd + next > maxFret ? 0 : next;
}

// 개방현 절대 음높이(반음, E2=0 기준). 인덱스 = 줄 번호
const OPEN_PITCH = [null, 24, 19, 15, 10, 5, 0];

// 루트에서 출발해 줄마다 두 음씩 1→3→5→7→1… 음높이 순서로 이어 가는 경로.
// 6번줄 루트에서 1번줄까지 올라가며 줄을 넘어갈 때마다 손이 조금씩 오른쪽으로 옮겨 간다.
// 예) C키 Dm7, 10프렛: 6줄 10·13 → 5줄 12·15 → 4줄 12·15 → 3줄 14·17 → 2줄 15·18 → 1줄 17·20
// direction: 'UP'(6→1), 'UPDOWN'(올라갔다 같은 길로 6번줄 루트까지)
export const NOTES_PER_STRING = 2;

export function getHandPath(tones, startFret, direction, maxFret = 24) {
  const strings = [6, 5, 4, 3, 2, 1];
  const step = 1;
  const pcs = tones.map((tone) => NOTES.indexOf(tone.note));
  const toneAt = (pitch) => tones[pcs.indexOf((((pitch + 4) % 12) + 12) % 12)]; // 기준 E2 = E(4)
  const rootPc = pcs[tones.findIndex((tone) => tone.degree === '1')];
  if (rootPc == null) return [];

  const build = (rootFret) => {
    const path = [];
    let pitch = OPEN_PITCH[strings[0]] + rootFret;
    for (const string of strings) {
      for (let count = 0; count < NOTES_PER_STRING; count += 1) {
        if (path.length) { pitch += step; while (!toneAt(pitch)) pitch += step; }
        const fret = pitch - OPEN_PITCH[string];
        if (fret < 0 || fret > maxFret) return null;
        path.push({ ...toneAt(pitch), string, fret, key: `${string}-${fret}` });
      }
    }
    return path;
  };

  // 시작 줄에서 시작 프렛에 가장 가까우면서 경로 전체가 지판 안에 들어오는 루트
  let path = null;
  let bestDistance = Infinity;
  for (let fret = 0; fret <= maxFret; fret += 1) {
    if ((OPEN_PITCH[strings[0]] + fret + 4) % 12 !== rootPc || Math.abs(fret - startFret) >= bestDistance) continue;
    const candidate = build(fret);
    if (candidate) { path = candidate; bestDistance = Math.abs(fret - startFret); }
  }
  if (!path) return [];

  // 손 위치: 지금 줄에서 치는 두 음을 덮는 범위(최소 4칸)
  const withHand = path.map((item) => {
    const frets = path.filter((other) => other.string === item.string).map((other) => other.fret);
    const low = Math.min(...frets);
    return { ...item, hand: [low, Math.max(low + 3, ...frets)], pass: 0, anchor: item.degree === '1' };
  });
  if (direction !== 'UPDOWN') return withHand;
  return [...withHand, ...[...withHand].reverse().slice(1).map((item) => ({ ...item, pass: 1 }))];
}

// 손을 한 포지션(6번줄 루트 기준 한 칸 아래 ~ 세 칸 위, 5칸)에 고정하고 1→3→5→7→1… 음높이 순서로 훑는 경로.
// 다음 음이 지금 줄의 포지션 안에 있으면 같은 줄에서, 없으면 다음 줄에서 잡는다.
// 그러면 b7(7)과 1이 같은 줄에 온다. 예) C키 Dm7, 10프렛: 6줄 10·13 → 5줄 12 → 4줄 10·12 → 3줄 10 → 2줄 10·13 → 1줄 10·13
export const BOX_BELOW = 1;
export const BOX_ABOVE = 3;

export function getBoxPath(tones, startFret, direction, maxFret = 24) {
  const pcs = tones.map((tone) => NOTES.indexOf(tone.note));
  const toneAt = (pitch) => tones[pcs.indexOf((pitch + 4) % 12)]; // 기준 E2 = E(4)
  const rootPc = pcs[tones.findIndex((tone) => tone.degree === '1')];
  if (rootPc == null) return [];

  // 포지션 왼쪽 끝이 시작 프렛에 오도록 그 한 칸 위에 가장 가까운 6번줄 루트를 고른다.
  let rootFret = null;
  for (let fret = BOX_BELOW; fret <= maxFret - BOX_ABOVE; fret += 1) {
    if ((fret + 4) % 12 === rootPc && (rootFret == null || Math.abs(fret - startFret - BOX_BELOW) < Math.abs(rootFret - startFret - BOX_BELOW))) rootFret = fret;
  }
  if (rootFret == null) return [];
  const hand = [Math.max(0, rootFret - BOX_BELOW), rootFret + BOX_ABOVE];

  const path = [];
  let string = 6;
  for (let pitch = OPEN_PITCH[6] + rootFret; string >= 1; pitch += 1) {
    if (!toneAt(pitch)) continue;
    while (string >= 1 && pitch - OPEN_PITCH[string] > hand[1]) string -= 1;
    if (string < 1) break;
    const fret = pitch - OPEN_PITCH[string];
    if (fret < hand[0]) continue; // 줄을 넘어간 직후 포지션 왼쪽 밖의 음은 건너뛴다
    path.push({ ...toneAt(pitch), string, fret, key: `${string}-${fret}`, hand, pass: 0, anchor: toneAt(pitch).degree === '1' });
  }
  if (direction !== 'UPDOWN') return path;
  return [...path, ...[...path].reverse().slice(1).map((item) => ({ ...item, pass: 1 }))];
}
