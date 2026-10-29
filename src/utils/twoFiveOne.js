import { Note } from 'tonal';
import { NOTES } from './notes.js';

// 차트(II-V-I in 12 Major Keys)와 같은 순서·표기. 4도씩 이동한다.
export const CHART_KEYS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'];

// 도수 → 인터벌. 철자는 tonal이 글자 기준으로 맞춘다(Gb 키에서 B 대신 Cb 등).
const INTERVALS = { 1: '1P', 2: '2M', b3: '3m', 3: '3M', 4: '4P', b5: '5d', 5: '5P', 6: '6M', b7: '7m', 7: '7M' };

export const PROGRESSIONS = {
  MAJOR: [
    { roman: 'ii', label: 'ii', degree: 2, quality: 'MIN7', suffix: 'm7', degrees: ['1', 'b3', '5', 'b7'] },
    { roman: 'V', label: 'V', degree: 5, quality: 'DOM7', suffix: '7', degrees: ['1', '3', '5', 'b7'] },
    { roman: 'I', label: 'I', degree: 1, quality: 'MAJ7', suffix: 'Δ7', degrees: ['1', '3', '5', '7'] },
  ],
  // 마이너 ii-V-i: 하프 디미니시드 → 도미넌트 → 마이너 7
  MINOR: [
    { roman: 'ii', label: 'iiø', degree: 2, quality: 'HALFDIM', suffix: 'm7♭5', degrees: ['1', 'b3', 'b5', 'b7'] },
    { roman: 'V', label: 'V', degree: 5, quality: 'DOM7', suffix: '7', degrees: ['1', '3', '5', 'b7'] },
    { roman: 'I', label: 'i', degree: 1, quality: 'MIN7', suffix: 'm7', degrees: ['1', 'b3', '5', 'b7'] },
  ],
};
export const PROGRESSION_LABELS = { MAJOR: '메이저 ii-V-I', MINOR: '마이너 iiø-V-i' };
export const TWO_FIVE_ONE_CHORDS = PROGRESSIONS.MAJOR;

export const GUIDE_DEGREES = ['b3', '3', 'b7', '7'];

// 마이너에서는 Db·Gb 마이너 대신 많이 쓰는 C#·F# 마이너로 적는다(Ebb 같은 겹내림표를 피함).
const MINOR_SPELLING = { Db: 'C#', Gb: 'F#' };
export const keyLabel = (key, mode = 'MAJOR') => (mode === 'MINOR' ? `${MINOR_SPELLING[key] ?? key} minor` : `${key} major`);

export function spellDegree(root, degree) {
  return Note.transpose(root, INTERVALS[degree]);
}

// 철자 표기(Cb, E# 등)를 지판 매칭용 샵 기준 pitch class 이름으로 바꾼다.
export function pitchName(name) {
  return NOTES[Note.chroma(name)];
}

export function getTwoFiveOne(key, mode = 'MAJOR') {
  const tonic = mode === 'MINOR' ? (MINOR_SPELLING[key] ?? key) : key;
  return PROGRESSIONS[mode].map((chord) => {
    const root = spellDegree(tonic, chord.degree);
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
// perString: 6번줄부터 줄마다 칠 음 수.
export const NOTES_PER_STRING = [2, 2, 2, 2, 2, 2];
// 6번줄은 루트 하나만 치고 줄마다 (3·5) (7·1)을 번갈아 → b7(7)과 1이 같은 줄에 온다.
// 예) C키 Dm7, 10프렛: 6줄 10 → 5줄 8·12 → 4줄 10·12 → 3줄 10·14 → 2줄 13·15 → 1줄 13·17
export const SEVEN_ONE_PER_STRING = [1, 2, 2, 2, 2, 2];

export function getHandPath(tones, startFret, direction, perString = NOTES_PER_STRING, maxFret = 24) {
  const strings = [6, 5, 4, 3, 2, 1];
  const step = 1;
  const pcs = tones.map((tone) => NOTES.indexOf(tone.note));
  const toneAt = (pitch) => tones[pcs.indexOf((((pitch + 4) % 12) + 12) % 12)]; // 기준 E2 = E(4)
  const rootPc = pcs[tones.findIndex((tone) => tone.degree === '1')];
  if (rootPc == null) return [];

  const build = (rootFret) => {
    const path = [];
    let pitch = OPEN_PITCH[strings[0]] + rootFret;
    for (const [index, string] of strings.entries()) {
      for (let count = 0; count < perString[index]; count += 1) {
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

  // 손 위치: 지금 줄에서 치는 음을 덮는 범위(최소 4칸)
  const withHand = path.map((item) => {
    const frets = path.filter((other) => other.string === item.string).map((other) => other.fret);
    const low = Math.min(...frets);
    return { ...item, hand: [low, Math.max(low + 3, ...frets)], pass: 0, anchor: item.degree === '1' };
  });
  if (direction !== 'UPDOWN') return withHand;
  return [...withHand, ...[...withHand].reverse().slice(1).map((item) => ({ ...item, pass: 1 }))];
}

