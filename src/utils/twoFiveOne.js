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

export const SWEEP_DIRECTIONS = { UP: '6→1 상행', DOWN: '1→6 하행', UPDOWN: '6→1→6 왕복' };

export const POSITION_SHIFTS = { OFF: '고정', KEY: '키마다 위로', CYCLE: '한 바퀴 돌면 위로' };

// 포지션을 shiftBy칸 위로 옮긴 오프셋. 범위 끝이 maxFret을 넘으면 처음 위치(오프셋 0)로 돌아온다.
export function nextPositionOffset(offset, shiftBy, rangeEnd, maxFret = 24) {
  const next = offset + shiftBy;
  return rangeEnd + next > maxFret ? 0 : next;
}

// 개방현 절대 음높이(반음, E2=0 기준). 인덱스 = 줄 번호
const OPEN_PITCH = [null, 24, 19, 15, 10, 5, 0];

// 루트에서 출발해 1→3→5→7→1… 음높이 순서로 이어 가는 손 경로.
// 손(손가락 4개)은 span칸을 덮고, 다음 음이 손 안에 없으면 진행 방향으로만 조금씩 옮겨 간다.
// direction: 'UP'(6→1, 손이 높은 프렛으로), 'DOWN'(1→6, 손이 낮은 프렛으로), 'UPDOWN'(올라갔다 같은 길로 루트까지)
export function getHandPath(tones, startFret, span, direction, maxFret = 24) {
  const up = direction !== 'DOWN';
  const pcs = tones.map((tone) => NOTES.indexOf(tone.note));
  const toneAt = (pitch) => tones[pcs.indexOf((pitch + 4) % 12)]; // E2 = pitch class E(4)
  const rootPc = pcs[tones.findIndex((tone) => tone.degree === '1')];
  if (rootPc == null) return [];

  // 시작 루트: 상행은 6·5번줄, 하행은 1·2번줄에서 시작 프렛에 가장 가까운 루트
  const startStrings = up ? [6, 5] : [1, 2];
  let start = null;
  for (const string of startStrings) {
    for (let fret = 0; fret <= maxFret; fret += 1) {
      if ((OPEN_PITCH[string] + fret + 4) % 12 !== rootPc) continue;
      const distance = Math.abs(fret - startFret);
      if (!start || distance < start.distance) start = { string, fret, distance };
    }
  }
  if (!start) return [];

  const step = up ? 1 : -1;
  // 상행: 손 왼쪽 끝 = 루트 프렛, 하행: 손 오른쪽 끝 = 루트 프렛
  let edge = start.fret;
  const window = () => (up ? [edge, edge + span - 1] : [edge - span + 1, edge]);
  const inHand = (fret) => fret >= window()[0] && fret <= window()[1];
  const forward = (fret) => (up ? fret >= window()[0] : fret <= window()[1]);
  let string = start.string;
  let pitch = OPEN_PITCH[string] + start.fret;
  const path = [{ ...toneAt(pitch), string, fret: start.fret, key: `${string}-${start.fret}`, hand: window() }];

  for (;;) {
    let next = pitch + step;
    while (!toneAt(next)) next += step;
    const options = [string, string - step]
      .filter((item) => item >= 1 && item <= 6)
      .map((item) => ({ string: item, fret: next - OPEN_PITCH[item] }))
      .filter((item) => item.fret >= 0 && item.fret <= maxFret && forward(item.fret));
    // 손 안에 있으면 지금 줄 우선(손 안을 꽉 채움), 없으면 다음 줄
    const pick = options.find((item) => item.string === string && inHand(item.fret)) ?? options.find((item) => inHand(item.fret));
    if (pick) {
      string = pick.string;
    } else {
      // 손을 진행 방향으로 최소한만 옮긴다. 마지막 줄에서 손 밖으로 나가면 끝.
      if (!options.length) break;
      const best = options.reduce((a, b) => (Math.abs(a.fret - edge) <= Math.abs(b.fret - edge) ? a : b));
      if (string === (up ? 1 : 6) && best.string === string) break;
      string = best.string;
      edge = up ? best.fret - span + 1 : best.fret + span - 1;
      edge = up ? Math.max(edge, window()[0]) : Math.min(edge, window()[1]);
      next = OPEN_PITCH[string] + best.fret;
      pitch = next;
      path.push({ ...toneAt(pitch), string, fret: best.fret, key: `${string}-${best.fret}`, hand: window() });
      continue;
    }
    pitch = next;
    path.push({ ...toneAt(pitch), string, fret: pick.fret, key: `${string}-${pick.fret}`, hand: window() });
  }

  const marked = path.map((item) => ({ ...item, pass: 0, anchor: item.degree === '1' }));
  if (direction !== 'UPDOWN') return marked;
  return [...marked, ...[...marked].reverse().slice(1).map((item) => ({ ...item, pass: 1 }))];
}
