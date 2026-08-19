import { getPitchClass, NOTES } from './notes.js';
import { OPEN_STRING_NOTES } from './tuning.js';

export const MAX_FRET = 24;
export const BASIC_MAX_FRET = 12;
export const INLAY_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export function getNoteAtFret(string, fret) {
  return NOTES[(getPitchClass(OPEN_STRING_NOTES[string - 1]) + fret) % 12];
}

export function createFretboard() {
  return Array.from({ length: 6 }, (_, index) => {
    const string = index + 1;
    return Array.from({ length: MAX_FRET + 1 }, (_, fret) => ({
      key: `${string}-${fret}`,
      string,
      fret,
      note: getNoteAtFret(string, fret),
    }));
  }).flat();
}

// 실제 12평균율에서 각 프렛 칸이 차지하는 상대 폭. 합이 1이 되도록 정규화한다.
export function getFretRatios(maxFret = MAX_FRET, nutWeight = 0.032) {
  const distances = Array.from({ length: maxFret }, (_, index) =>
    2 ** (-index / 12) - 2 ** (-(index + 1) / 12));
  const sum = distances.reduce((total, value) => total + value, 0);
  return [nutWeight, ...distances.map((distance) => (distance / sum) * (1 - nutWeight))];
}
