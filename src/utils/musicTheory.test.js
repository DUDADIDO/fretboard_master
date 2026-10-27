import { describe, expect, it } from 'vitest';
import { getNoteAtFret } from './fretboard.js';
import { fretFrequency } from './guitarSound.js';
import { getChordTones } from './chords.js';
import { getIntervalPattern } from './intervals.js';
import { getPentatonicTargets } from './pentatonic.js';
import { CHART_KEYS, getHandPath, getTwoFiveOne, nextPositionOffset } from './twoFiveOne.js';
import { ALL_NOTE_SPELLINGS, canonicalNote, getNotePool, noteLabel, selectableNotes, spellingPreference } from './notes.js';

describe('표준 튜닝과 지판', () => {
  it('개방현과 12/24프렛 옥타브를 계산한다', () => {
    expect([1, 2, 3, 4, 5, 6].map((s) => getNoteAtFret(s, 0))).toEqual(['E', 'B', 'G', 'D', 'A', 'E']);
    expect(getNoteAtFret(6, 12)).toBe('E');
    expect(getNoteAtFret(6, 24)).toBe('E');
  });
});

describe('직접 연습 음 목록', () => {
  it('기본음·샵·플랫을 별도 표기로 모두 포함한다', () => {
    expect(ALL_NOTE_SPELLINGS).toHaveLength(17);
    expect(ALL_NOTE_SPELLINGS).toEqual(expect.arrayContaining(['C#', 'Db']));
    expect(new Set(ALL_NOTE_SPELLINGS.map(canonicalNote)).size).toBe(12);
  });
});

describe('샵·플랫 동시 선택 표기', () => {
  it('출제된 음의 표기를 그대로 보여준다', () => {
    const pool = getNotePool({ natural: false, sharp: true, flat: true });
    expect(pool).toEqual(expect.arrayContaining(['C#', 'Db']));
    expect(noteLabel('C#', 'BOTH')).toBe('C#');
    expect(noteLabel('Db', 'BOTH')).toBe('Db');
    expect(selectableNotes('BOTH')).toEqual(expect.arrayContaining(['C#', 'Db']));
    expect(noteLabel('C#', spellingPreference('Db', 'BOTH'))).toBe('Db');
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

describe('ii-V-I', () => {
  it('차트 순서의 코드 이름을 그대로 만든다', () => {
    expect(CHART_KEYS.map((key) => getTwoFiveOne(key).map((chord) => chord.symbol).join(' '))).toEqual([
      'Dm7 G7 CΔ7', 'Gm7 C7 FΔ7', 'Cm7 F7 BbΔ7', 'Fm7 Bb7 EbΔ7', 'Bbm7 Eb7 AbΔ7', 'Ebm7 Ab7 DbΔ7',
      'Abm7 Db7 GbΔ7', 'C#m7 F#7 BΔ7', 'F#m7 B7 EΔ7', 'Bm7 E7 AΔ7', 'Em7 A7 DΔ7', 'Am7 D7 GΔ7',
    ]);
  });

  it('C 키 코드톤 표와 일치한다', () => {
    expect(getTwoFiveOne('C').map((chord) => chord.tones.map((tone) => tone.name))).toEqual([
      ['D', 'F', 'A', 'C'], ['G', 'B', 'D', 'F'], ['C', 'E', 'G', 'B'],
    ]);
  });

  it('Gb 키는 Cb으로 표기하되 지판 매칭은 B로 한다', () => {
    const [ii, V] = getTwoFiveOne('Gb');
    expect(ii.tones.map((tone) => tone.name)).toEqual(['Ab', 'Cb', 'Eb', 'Gb']);
    expect(V.tones[3]).toMatchObject({ name: 'Cb', note: 'B' });
  });

  it('B 키는 샵 계열로 표기한다', () => {
    expect(getTwoFiveOne('B')[2].tones.map((tone) => tone.name)).toEqual(['B', 'D#', 'F#', 'A#']);
  });
});

describe('포지션 이동', () => {
  it('정한 칸만큼 올리고 24프렛을 넘으면 처음 위치로 돌아온다', () => {
    expect(nextPositionOffset(0, 2, 8)).toBe(2);
    expect(nextPositionOffset(14, 2, 8)).toBe(16);
    expect(nextPositionOffset(16, 2, 8)).toBe(0);
  });
});

describe('루트에서 이어 가는 손 경로', () => {
  const order = { MIN7: ['1', 'b3', '5', 'b7'], DOM7: ['1', '3', '5', 'b7'], MAJ7: ['1', '3', '5', '7'] };
  const pitch = (item) => [null, 24, 19, 15, 10, 5, 0][item.string] + item.fret;

  it.each(CHART_KEYS.flatMap((key) => getTwoFiveOne(key).map((chord) => [key, chord])))('%s %o: 루트 시작, 1357 순환, 손은 오른쪽으로만', (key, chord) => {
    for (const start of [1, 5, 9]) {
      const path = getHandPath(chord.tones, start, 4, 'UP');
      expect(path[0].degree).toBe('1');
      expect([6, 5]).toContain(path[0].string);
      const degrees = order[chord.quality];
      path.forEach((item, index) => {
        expect(item.degree).toBe(degrees[index % 4]);
        expect(item.fret).toBeGreaterThanOrEqual(item.hand[0]);
        expect(item.fret).toBeLessThanOrEqual(item.hand[1]);
        if (index) {
          expect(pitch(item)).toBeGreaterThan(pitch(path[index - 1]));
          expect(item.hand[0]).toBeGreaterThanOrEqual(path[index - 1].hand[0]);
        }
      });
      expect(path.at(-1).string).toBeLessThanOrEqual(2);
    }
  });

  it('C키 G7을 5프렛 근처에서 시작하면 손이 점점 높은 프렛으로 간다', () => {
    const path = getHandPath(getTwoFiveOne('C')[1].tones, 5, 4, 'UP');
    expect(path[0]).toMatchObject({ string: 6, fret: 3, degree: '1' });
    expect(path.at(-1).hand[0]).toBeGreaterThan(path[0].hand[0]);
  });

  it('하행은 1·2번줄 루트에서 내려가고, 왕복은 같은 길로 루트까지 돌아온다', () => {
    const dm7 = getTwoFiveOne('C')[0].tones;
    const down = getHandPath(dm7, 10, 4, 'DOWN');
    expect(down[0]).toMatchObject({ string: 1, degree: '1' });
    expect(down.map((item) => item.degree).slice(0, 5)).toEqual(['1', 'b7', '5', 'b3', '1']);
    const up = getHandPath(dm7, 10, 4, 'UP');
    const round = getHandPath(dm7, 10, 4, 'UPDOWN');
    expect(round).toHaveLength(up.length * 2 - 1);
    expect(round.at(-1).key).toBe(up[0].key);
  });
});

describe('기타 소리 음높이', () => {
  it('표준 튜닝 개방현과 프렛 음높이', () => {
    expect([6, 5, 4, 3, 2, 1].map((string) => Math.round(fretFrequency(string, 0) * 100) / 100)).toEqual([82.41, 110, 146.83, 196, 246.94, 329.63]);
    expect(fretFrequency(1, 5)).toBeCloseTo(440, 6);
    expect(fretFrequency(6, 12)).toBeCloseTo(fretFrequency(6, 0) * 2, 6);
  });
});
