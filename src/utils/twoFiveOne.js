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
