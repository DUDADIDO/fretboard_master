import { describe, expect, it } from 'vitest';
import { getNoteAtFret } from './fretboard.js';
import { getChordTones } from './chords.js';
import { getIntervalPattern } from './intervals.js';
import { getPentatonicTargets } from './pentatonic.js';

describe('표준 튜닝과 지판', () => {
  it('개방현과 12/24프렛 옥타브를 계산한다', () => {
    expect([1, 2, 3, 4, 5, 6].map((s) => getNoteAtFret(s, 0))).toEqual(['E', 'B', 'G', 'D', 'A', 'E']);
    expect(getNoteAtFret(6, 12)).toBe('E');
    expect(getNoteAtFret(6, 24)).toBe('E');
  });
});

describe('펜타토닉', () => {
  it('E 메이저 P1의 12개 위치에 모두 유효한 도수를 배정한다', () => {
    const targets = getPentatonicTargets('E', 'MAJOR', 1);
    expect(targets).toHaveLength(12);
    expect(targets.every((target) => target.degree)).toBe(true);
  });
});

describe('코드톤', () => {
  it.each([
    ['MAJ7', ['C', 'E', 'G', 'B']],
    ['MIN7', ['C', 'D#', 'G', 'A#']],
    ['DOM7', ['C', 'E', 'G', 'A#']],
  ])('C %s 음을 계산한다', (quality, expected) => {
    expect(getChordTones('C', quality).map((tone) => tone.note)).toEqual(expected);
  });

  it('6번줄의 모든 G가 C 코드의 5도 pitch class다', () => {
    const fifth = getChordTones('C', 'MAJ7')[2].note;
    expect([3, 15].map((fret) => getNoteAtFret(6, fret))).toEqual([fifth, fifth]);
  });

  it('양방향 5도와 G-B 경계를 보정한다', () => {
    expect(getIntervalPattern(6, '5')).toMatchObject({ thin: 0 });
    expect(getIntervalPattern(2, '3')).toMatchObject({ thick: 0, crossesGBoundary: true });
    expect(getIntervalPattern(3, '3')).toMatchObject({ thin: -4, crossesGBoundary: true });
  });
});
