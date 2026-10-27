import { describe, expect, it } from 'vitest';
import { ALL_NOTE_SPELLINGS, getNotePool } from '../../utils/notes.js';
import { advanceSession, createSession } from './session.js';

describe('실제 기타 연습', () => {
  it.each([
    { natural: true, sharp: false, flat: false },
    { natural: false, sharp: true, flat: false },
    { natural: false, sharp: false, flat: true },
    { natural: true, sharp: true, flat: false },
    { natural: true, sharp: false, flat: true },
    { natural: false, sharp: true, flat: true },
    { natural: true, sharp: true, flat: true },
  ])('선택한 음 범위만 랜덤과 전체 순회에 유지한다: %j', (types) => {
    const pool = getNotePool(types);
    let random = createSession('RANDOM', undefined, 1, pool);
    let all = createSession('ALL_ONCE', undefined, 1, pool);
    for (let round = 0; round < 3; round += 1) {
      const seen = [];
      for (let index = 0; index < pool.length; index += 1) {
        expect(pool).toContain(random.queue[0]);
        random = advanceSession(random);
        seen.push(all.queue[all.index]);
        all = advanceSession(all);
      }
      expect(seen.sort()).toEqual([...pool].sort());
    }
  });
  it('각 회차에 모든 표기를 정확히 한 번씩 내고 다음 회차로 넘어간다', () => {
    let session = createSession('ALL_ONCE');
    for (let round = 1; round <= 10; round += 1) {
      const seen = [];
      for (let index = 0; index < 17; index += 1) {
        expect(session.round).toBe(round);
        expect(session.index).toBe(index);
        seen.push(session.queue[session.index]);
        session = advanceSession(session);
      }
      expect(seen.sort()).toEqual([...ALL_NOTE_SPELLINGS].sort());
    }
  });
  it('랜덤 1음은 유효한 표기를 내고 직전 표기를 반복하지 않는다', () => {
    let session = createSession();
    for (let i = 0; i < 100; i += 1) {
      const previous = session.queue[0];
      session = advanceSession(session);
      expect(ALL_NOTE_SPELLINGS).toContain(session.queue[0]);
      expect(session.queue[0]).not.toBe(previous);
    }
  });
  it('회차 경계에서도 직전 표기를 반복하지 않는다', () => {
    for (let i = 0; i < 100; i += 1) {
      const session = { ...createSession('ALL_ONCE'), index: 16 };
      expect(advanceSession(session).queue[0]).not.toBe(session.queue[16]);
    }
  });
});
