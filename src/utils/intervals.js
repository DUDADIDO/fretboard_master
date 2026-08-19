import { getNoteAtFret, MAX_FRET } from './fretboard.js';
import { isSamePitchClass, transpose } from './notes.js';
import { crossesGBoundary } from './tuning.js';

export const THIRD_INTERVALS = { MAJOR: 4, MINOR: 3 };

export function getThirdTargets(rootString, rootFret, rootNote, quality) {
  const interval = THIRD_INTERVALS[quality];
  const targetNote = transpose(rootNote, interval);
  const shift = quality === 'MINOR' ? -1 : 0;
  const candidates = [];
  const add = (string, fret, label) => {
    if (string < 1 || string > 6 || fret < 0 || fret > MAX_FRET) return;
    if (!isSamePitchClass(getNoteAtFret(string, fret), targetNote)) return;
    candidates.push({ key: `${string}-${fret}`, string, fret, label, note: targetNote });
  };
  add(rootString, rootFret + 4 + shift, '같은 줄');
  if (rootString > 1) add(rootString - 1, rootFret + (rootString === 3 ? 0 : -1) + shift, '얇은 쪽');
  if (rootString < 6) add(rootString + 1, rootFret + (rootString === 2 ? -4 : -3) + shift, '두꺼운 쪽');
  return { targetNote, candidates };
}

export function getIntervalPattern(targetString, degree) {
  const semitones = { 'b3': 3, 3: 4, 5: 7 }[degree];
  if (semitones == null) return null;
  const thickCorrection = crossesGBoundary(targetString, targetString + 1) ? 1 : 0;
  const thinCorrection = crossesGBoundary(targetString, targetString - 1) ? -1 : 0;
  return {
    thick: targetString < 6 ? semitones - 5 + thickCorrection : null,
    thin: targetString > 1 ? semitones - 7 + thinCorrection : null,
    crossesGBoundary: targetString === 2 || targetString === 3,
  };
}
