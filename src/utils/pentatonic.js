import { getNoteAtFret } from './fretboard.js';
import { getPitchClass, transpose } from './notes.js';

export const MINOR_BOX_PATTERNS = {
  1: [[0, 3], [0, 2], [0, 2], [0, 2], [0, 3], [0, 3]],
  2: [[3, 5], [2, 5], [2, 5], [2, 4], [3, 5], [3, 5]],
  3: [[5, 7], [5, 7], [5, 7], [4, 7], [5, 8], [5, 7]],
  4: [[7, 10], [7, 10], [7, 9], [7, 9], [8, 10], [7, 10]],
  5: [[10, 12], [10, 12], [9, 12], [9, 12], [10, 12], [10, 12]],
};

export const PENTA_STEPS = {
  MAJOR: [{ degree: '1', interval: 0 }, { degree: '2', interval: 2 }, { degree: '3', interval: 4 }, { degree: '5', interval: 7 }, { degree: '6', interval: 9 }],
  MINOR: [{ degree: '1', interval: 0 }, { degree: 'b3', interval: 3 }, { degree: '4', interval: 5 }, { degree: '5', interval: 7 }, { degree: 'b7', interval: 10 }],
};

export function getPentatonicTargets(root, quality, position) {
  const minorRoot = quality === 'MINOR' ? root : transpose(root, -3);
  // 박스 패턴의 offset은 6번줄(E)에서 시작하는 실제 프렛 위치다.
  const anchor = (getPitchClass(minorRoot) - getPitchClass('E') + 12) % 12;
  return Array.from({ length: 6 }, (_, index) => 6 - index).flatMap((string, row) =>
    MINOR_BOX_PATTERNS[position][row].map((offset) => {
      let fret = anchor + offset;
      while (fret > 24) fret -= 12;
      while (fret < 0) fret += 12;
      const note = getNoteAtFret(string, fret);
      const interval = (getPitchClass(note) - getPitchClass(root) + 12) % 12;
      return { key: `${string}-${fret}`, string, fret, note, degree: PENTA_STEPS[quality].find((step) => step.interval === interval)?.degree };
    }),
  );
}
