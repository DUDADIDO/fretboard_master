import { describe, expect, it } from 'vitest';
import { createNoteTracker, judgeHeard } from './noteTracker.js';

const FRAME = 1000 / 60;

// 프레임 흐름을 흉내 낸다. handled: 맞는 음(onNote가 처리)으로 볼 음들. handledOnce: 첫 번째만 맞는 음.
function run(segments, { handled = [], handledOnce = [] } = {}) {
  const notes = [];
  const misses = [];
  const tracker = createNoteTracker({
    onNote: (semitone) => {
      notes.push(semitone);
      return handled.includes(semitone) || (handledOnce.includes(semitone) && notes.length === 1);
    },
    onMiss: (semitone) => misses.push(semitone),
  });
  let now = 0;
  for (const { ms, rms, semitone = null, muteFor } of segments) {
    if (muteFor) tracker.mute(now + muteFor);
    const frames = Math.round(ms / FRAME);
    for (let index = 0; index < frames; index += 1) {
      const level = typeof rms === 'function' ? rms(index / frames) : rms;
      tracker.frame({ now, rms: level, semitone });
      now += FRAME;
    }
  }
  return { notes, misses };
}
const silence = (ms) => ({ ms, rms: 0.001 });

describe('마이크 오답 판별', () => {
  it('조용하다가 틀린 음을 치면 오답 한 번', () => {
    expect(run([silence(300), { ms: 500, rms: 0.1, semitone: 5 }]).misses).toEqual([5]);
  });

  it('맞는 음은 오답이 아니다', () => {
    const { notes, misses } = run([silence(300), { ms: 500, rms: 0.1, semitone: 5 }], { handled: [5] });
    expect(notes).toEqual([5]);
    expect(misses).toEqual([]);
  });

  it('피킹 순간 잠깐 스친 음은 오답이 아니다', () => {
    const { misses } = run([silence(300), { ms: 120, rms: 0.1, semitone: 3 }, { ms: 500, rms: 0.1, semitone: 5 }], { handled: [5] });
    expect(misses).toEqual([]);
  });

  it('맞게 친 음이 줄어들다 배음으로 튀어도 오답이 아니다', () => {
    const decay = (from, to) => (t) => from + (to - from) * t;
    const { misses } = run([
      silence(300),
      { ms: 800, rms: decay(0.1, 0.03), semitone: 5 },
      { ms: 500, rms: decay(0.03, 0.015), semitone: 24 },
    ], { handled: [5] });
    expect(misses).toEqual([]);
  });

  it('맞게 친 음이 줄어들다 잠깐 끊겼다 다시 잡혀도 오답이 아니다', () => {
    // 첫 번째만 맞는 음으로 처리된다. 그 뒤로는 차례가 다음 음으로 넘어가 있다.
    const { notes, misses } = run([
      silence(300),
      { ms: 600, rms: 0.05, semitone: 5 },
      { ms: 100, rms: 0.04 },
      { ms: 500, rms: 0.035, semitone: 5 },
    ], { handledOnce: [5] });
    expect(notes).toEqual([5, 5]);
    expect(misses).toEqual([]);
  });

  it('앞 음이 울리는 중에 틀린 음을 새로 치면 오답', () => {
    const { misses } = run([silence(300), { ms: 500, rms: 0.05, semitone: 5 }, { ms: 500, rms: 0.12, semitone: 8 }], { handled: [5] });
    expect(misses).toEqual([8]);
  });

  it('같은 틀린 음을 다시 치면 또 오답', () => {
    const { misses } = run([silence(300), { ms: 400, rms: 0.05, semitone: 8 }, { ms: 400, rms: 0.12, semitone: 8 }]);
    expect(misses).toEqual([8, 8]);
  });

  it('듣기를 멈춘 동안의 버저와 그 뒤 남은 울림은 오답이 아니다', () => {
    const { misses, notes } = run([
      silence(300),
      { ms: 300, rms: 0.2, semitone: 12, muteFor: 300 }, // 버저가 마이크로 들어옴
      { ms: 300, rms: 0.05, semitone: 12 }, // 방에 남은 울림
    ]);
    expect(notes).toEqual([12]);
    expect(misses).toEqual([]);
  });
});

describe('들린 음 판정', () => {
  it('정해진 칸이면 한 옥타브 차이까지 맞고, 더 떨어지면 판단 보류', () => {
    expect(judgeHeard(10, 10)).toBe('right');
    expect(judgeHeard(22, 10)).toBe('right');
    expect(judgeHeard(-2, 10)).toBe('right');
    expect(judgeHeard(34, 10)).toBe('ignore');
  });

  it('배음은 오답으로 치지 않고, 그 밖의 음은 오답', () => {
    expect(judgeHeard(29, 10)).toBe('ignore');
    expect(judgeHeard(38, 10)).toBe('ignore');
    expect(judgeHeard(11, 10)).toBe('wrong');
    expect(judgeHeard(17, 10)).toBe('wrong');
  });

  it('음이름만 맞으면 되는 문제는 어느 옥타브든 맞다', () => {
    expect(judgeHeard(46, 10, { anyOctave: true })).toBe('right');
    expect(judgeHeard(17, 10, { anyOctave: true })).toBe('wrong');
  });
});
