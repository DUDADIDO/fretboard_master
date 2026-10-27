import { isSamePitchClass, NOTES } from './notes.js';
import { getNoteAtFret } from './fretboard.js';

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

// 포지션(시작 프렛부터 width칸) 안의 코드톤을 음높이 순서로 훑는 순서. 왕복은 맨 위 음을 한 번만 친다.
export function getSweepSequence(tones, startFret, width, direction) {
  const up = [];
  for (let string = 6; string >= 1; string -= 1) {
    for (let fret = startFret; fret < startFret + width; fret += 1) {
      const tone = tones.find((item) => isSamePitchClass(item.note, getNoteAtFret(string, fret)));
      if (tone) up.push({ ...tone, key: `${string}-${fret}`, string, fret });
    }
  }
  const down = [...up].reverse();
  if (direction === 'DOWN') return down.map((item) => ({ ...item, pass: 0 }));
  if (direction === 'UPDOWN') return [...up.map((item) => ({ ...item, pass: 0 })), ...down.slice(1).map((item) => ({ ...item, pass: 1 }))];
  return up.map((item) => ({ ...item, pass: 0 }));
}

export const POSITION_SHIFTS = { OFF: '고정', KEY: '키마다 위로', CYCLE: '한 바퀴 돌면 위로' };

// 포지션을 shiftBy칸 위로 옮긴 오프셋. 범위 끝이 maxFret을 넘으면 처음 위치(오프셋 0)로 돌아온다.
export function nextPositionOffset(offset, shiftBy, rangeEnd, maxFret = 24) {
  const next = offset + shiftBy;
  return rangeEnd + next > maxFret ? 0 : next;
}
