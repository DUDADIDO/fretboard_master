import { transpose } from './notes.js';
import { getIntervalPattern } from './intervals.js';

export const CHORDS = {
  MAJ7: { label: 'Maj7', degrees: ['1', '3', '5', '7'], intervals: [0, 4, 7, 11] },
  MIN7: { label: 'm7', degrees: ['1', 'b3', '5', 'b7'], intervals: [0, 3, 7, 10] },
  DOM7: { label: '7', degrees: ['1', '3', '5', 'b7'], intervals: [0, 4, 7, 10] },
};

export function getChordTones(root, quality) {
  return CHORDS[quality].intervals.map((interval, index) => ({
    degree: CHORDS[quality].degrees[index],
    interval,
    note: transpose(root, interval),
  }));
}

export function getChordToneHint(rootFret, targetString, degree) {
  if (degree === '1') return '선택한 줄에서 Root 음을 찾으세요.';
  if (degree === '7') return `현재 줄 Root ${rootFret}프렛 기준 -1프렛 또는 +11프렛의 같은 음을 찾으세요.`;
  if (degree === 'b7') return `현재 줄 Root ${rootFret}프렛 기준 -2프렛 또는 +10프렛의 같은 음을 찾으세요.`;
  const pattern = getIntervalPattern(targetString, degree);
  const parts = [];
  if (pattern.thick != null) parts.push(`두꺼운 인접 줄 Root에서 ${formatOffset(pattern.thick)}`);
  if (pattern.thin != null) parts.push(`얇은 인접 줄 Root에서 ${formatOffset(pattern.thin)}`);
  return `${parts.join(' · ')}${pattern.crossesGBoundary ? ' · G–B 경계 1프렛 보정' : ''}`;
}

function formatOffset(value) {
  return value === 0 ? '같은 프렛' : `${value > 0 ? '+' : ''}${value}프렛`;
}
