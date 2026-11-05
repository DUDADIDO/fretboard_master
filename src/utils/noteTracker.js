// 마이크 프레임(시각·소리 크기·음높이)을 받아 "친 음"과 "틀린 음"을 가려낸다. 오디오 장치와 분리해서 테스트한다.
// 음높이는 E2(6번줄 개방현)=0 기준 반음 수. 음높이를 못 잡은 프레임은 semitone이 null이다.
const STABLE_FRAMES = 3; // 같은 음이 이만큼 이어져야 친 것으로 본다
const SILENT_FRAMES = 4; // 이만큼 안 들리면 다음 음을 받을 준비
const REPLUCK = 1.8; // 같은 음이라도 소리가 이 배수만큼 커지면 다시 친 것으로 본다
// 오답은 오탐이 더 나쁘다. 맞는 음을 쳤는데 버저가 울리면 연습이 안 되므로 더 엄격하게 본다.
const STEADY_MS = 180; // 같은 음이 이만큼 이어져야 오답으로 본다(피킹 순간의 흔들림 제외)
const BASELINE_MS = 300; // 음이 바뀌기 직전 이만큼의 가장 작은 소리를 기준으로
const RISE = 1.3; // 기준보다 이 배수만큼 커져야 새로 친 음이다(줄어드는 앞 음이 배음으로 튀는 것 제외)

export function createNoteTracker({ onNote, onMiss }) {
  const state = { candidate: null, count: 0, silent: 0, fired: null, floor: Infinity, armed: false, attackAt: 0, baseline: 0, peak: 0, muteUntil: 0 };
  let history = [];

  return {
    // 버저가 스피커에서 나와 마이크로 다시 들어오는 동안은 듣지 않는다.
    mute(until) { state.muteUntil = until; },
    frame({ now, rms, semitone }) {
      const lowest = history.reduce((low, item) => Math.min(low, item.rms), Infinity);
      history.push({ now, rms });
      history = history.filter((item) => now - item.now <= BASELINE_MS);
      if (now < state.muteUntil) return;
      if (semitone == null) {
        state.silent += 1;
        if (state.silent >= SILENT_FRAMES) { state.fired = null; state.candidate = null; state.count = 0; state.floor = Infinity; state.armed = false; }
        return;
      }
      state.silent = 0;
      if (semitone !== state.candidate) {
        state.candidate = semitone; state.count = 0;
        state.attackAt = now; state.baseline = lowest === Infinity ? 0 : lowest; state.peak = rms;
      }
      state.count += 1;
      state.floor = Math.min(state.floor, rms);
      state.peak = Math.max(state.peak, rms);
      const repluck = state.fired === semitone && rms > state.floor * REPLUCK;
      if (state.count >= STABLE_FRAMES && (state.fired !== semitone || repluck)) {
        if (repluck) { state.attackAt = now; state.baseline = state.floor; state.peak = rms; }
        state.fired = semitone; state.floor = rms;
        // onNote가 처리했다고 답하면(맞는 음·판단 보류) 오답 후보에서 뺀다.
        state.armed = !onNote?.(semitone);
      }
      if (state.armed && now - state.attackAt >= STEADY_MS) {
        state.armed = false;
        if (state.peak >= state.baseline * RISE) onMiss?.(semitone);
      }
    },
  };
}

// 들린 음(heard)을 지금 차례의 음(target)과 비교한다. anyOctave: 옥타브가 정해지지 않은 문제(음이름만 맞으면 됨).
// 저음 줄은 기본음보다 배음이 크게 잡힐 수 있어 옥타브가 다른 같은 음과 배음은 오답으로 치지 않는다.
const HARMONICS = [19, 28]; // 3·5배음
export function judgeHeard(heard, target, { anyOctave = false } = {}) {
  const diff = heard - target;
  if (((diff % 12) + 12) % 12 === 0) return anyOctave || Math.abs(diff) <= 12 ? 'right' : 'ignore';
  if (!anyOctave && HARMONICS.includes(diff)) return 'ignore';
  return 'wrong';
}
