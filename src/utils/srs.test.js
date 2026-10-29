import { describe, expect, it } from 'vitest';
import { Rating } from 'ts-fsrs';
import { dueCount, gradeFor, pickNext, resetReview, review } from './srs.js';

describe('약점 복습(FSRS)', () => {
  it('실수·속도로 점수를 매긴다', () => {
    expect(gradeFor({ mistakes: 1, secondsPerAnswer: 1 })).toBe(Rating.Again);
    expect(gradeFor({ mistakes: 0, secondsPerAnswer: 6 })).toBe(Rating.Hard);
    expect(gradeFor({ mistakes: 0, secondsPerAnswer: 2.5 })).toBe(Rating.Good);
    expect(gradeFor({ mistakes: 0, secondsPerAnswer: 1 })).toBe(Rating.Easy);
  });

  it('틀린 문제는 1분 뒤 다시 나오고, 잘 맞힌 문제보다 먼저 나온다', async () => {
    resetReview();
    const now = new Date('2026-10-29T10:00:00Z');
    await review('note:C@all', Rating.Again, now);
    await review('note:D@all', Rating.Easy, now);
    const ids = ['note:C@all', 'note:D@all'];
    expect(dueCount(ids, now)).toBe(0);
    const later = new Date(now.getTime() + 61_000);
    expect(dueCount(ids, later)).toBe(1);
    expect(pickNext(ids, null, later)).toBe('note:C@all');
  });

  it('때가 된 복습이 없으면 아직 안 본 문제를 먼저 낸다', async () => {
    resetReview();
    const now = new Date('2026-10-29T10:00:00Z');
    await review('note:C@all', Rating.Good, now);
    expect(pickNext(['note:C@all', 'note:E@all'], null, now)).toBe('note:E@all');
  });

  it('바로 전 문제는 다시 내지 않는다', () => {
    resetReview();
    for (let index = 0; index < 20; index += 1) expect(pickNext(['note:C@all', 'note:D@all'], 'note:C@all')).toBe('note:D@all');
  });
});
