// 지판을 누르면 그 칸의 실제 음높이로 기타 줄 뜯는 소리를 낸다.
// 녹음 파일 없이 Karplus-Strong 방식(잡음 → 짧은 지연선 반복 + 평균 필터)으로 바로 만든다.

// A4 = 440Hz 기준. E2는 A4보다 29반음 낮다.
const E2 = 440 * 2 ** (-29 / 12);
// 개방현 음높이(E2 기준 반음). 인덱스 = 줄 번호
const OPEN_SEMITONES = [null, 24, 19, 15, 10, 5, 0];

// E2(6번줄 개방현)=0 기준 반음 수
export function fretSemitone(string, fret) {
  return OPEN_SEMITONES[string] + fret;
}

export function fretFrequency(string, fret) {
  return E2 * 2 ** ((OPEN_SEMITONES[string] + fret) / 12);
}

let audio = null;
const buffers = new Map();
const ringing = new Map(); // 줄마다 울리는 소리. 같은 줄을 다시 누르면 이전 음을 멈춘다.

function getContext() {
  if (!audio) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audio = new AudioContextClass();
  }
  if (audio.state === 'suspended') audio.resume?.().catch(() => {});
  return audio;
}

// 지연선 길이가 정수라 생기는 음높이 오차는 재생 속도로 맞춘다.
function pluckBuffer(context, frequency) {
  const rate = context.sampleRate;
  const period = Math.max(2, Math.floor(rate / frequency));
  const cacheKey = `${rate}:${period}`;
  if (buffers.has(cacheKey)) return { buffer: buffers.get(cacheKey), period };

  const length = Math.floor(rate * 2.2);
  const buffer = context.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  const line = new Float32Array(period);
  // 살짝 걸러낸 잡음으로 시작하면 피크 소리가 덜 날카롭다.
  let previous = 0;
  for (let index = 0; index < period; index += 1) {
    previous = previous * 0.5 + (Math.random() * 2 - 1) * 0.5;
    line[index] = previous;
  }
  // 한 주기마다 곱하는 감쇠. 낮은 음일수록 오래(약 2.5초) 울리고 높은 음은 짧게 울린다.
  const cycleFrequency = rate / (period - 0.5);
  const ringSeconds = cycleFrequency < 200 ? 2.5 : cycleFrequency < 500 ? 1.8 : 1.2;
  const decay = 10 ** (-3 / (cycleFrequency * ringSeconds));
  let position = 0;
  for (let index = 0; index < length; index += 1) {
    const current = line[position];
    const next = line[(position + 1) % period];
    data[index] = current;
    line[position] = decay * 0.5 * (current + next);
    position = (position + 1) % period;
  }
  buffers.set(cacheKey, buffer);
  return { buffer, period };
}

// 실제 녹음된 기타 소리(smplr의 General MIDI 사운드폰트). 고르면 그때 받아 오고, 받는 동안은 합성 소리로 낸다.
export const INSTRUMENTS = {
  synth: '합성(가벼움)',
  electric_guitar_clean: '일렉 클린',
  electric_guitar_jazz: '재즈',
  overdriven_guitar: '크런치',
  distortion_guitar: '디스토션',
  acoustic_guitar_steel: '어쿠스틱',
  acoustic_guitar_nylon: '클래식',
  'amp-clean': '앰프 클린 · Two-Rock',
  'amp-overdrive': '오버드라이브 · SD-1',
  'amp-crunch': '크런치 · 5150III',
  'amp-highgain': '하이게인 · Rectifier',
};
let instrument = 'synth';
const samplers = new Map(); // 이름 → { player, ready }
const sampled = new Map(); // 줄마다 울리는 샘플 소리의 stop 함수

// NAM 앰프 톤: 모든 음(E2부터 49음)을 실제 앰프 캡처(NAM)에 미리 통과시켜 녹음한 스프라이트.
// 한 음이 1.5초 칸에 들어 있고, MP3 앞 지연을 피하려고 칸마다 소리가 시작하는 지점을 찾아 둔다.
const AMP_SLOT = 1.5;
const AMP_LENGTH = 1.35;
function loadAmp(context, name, entry) {
  fetch(`/sounds/${name}.mp3`).then((response) => response.arrayBuffer()).then((data) => context.decodeAudioData(data)).then((buffer) => {
    const samples = buffer.getChannelData(0);
    const slot = Math.round(AMP_SLOT * buffer.sampleRate);
    entry.onsets = Array.from({ length: 49 }, (_, index) => {
      let position = index * slot;
      const end = Math.min(samples.length, position + Math.round(0.2 * buffer.sampleRate));
      while (position < end && Math.abs(samples[position]) < 0.004) position += 1;
      return Math.max(index * slot, position - Math.round(0.002 * buffer.sampleRate)) / buffer.sampleRate;
    });
    entry.buffer = buffer;
    entry.ready = true;
  }).catch(() => samplers.delete(name));
}

export function setInstrument(name) {
  instrument = INSTRUMENTS[name] ? name : 'synth';
  if (instrument === 'synth' || samplers.has(instrument)) return;
  const context = getContext();
  if (!context) return;
  const entry = { player: null, ready: false };
  samplers.set(instrument, entry);
  if (instrument.startsWith('amp-')) { loadAmp(context, instrument, entry); return; }
  import('smplr').then(({ Soundfont }) => {
    entry.player = Soundfont(context, { instrument });
    return entry.player.ready;
  }).then(() => { entry.ready = true; }).catch(() => samplers.delete(instrument));
}

function playAmp(entry, string, fret, volume) {
  const context = getContext();
  const now = context.currentTime;
  const source = context.createBufferSource();
  source.buffer = entry.buffer;
  const gain = context.createGain();
  gain.gain.value = volume * 1.4;
  source.connect(gain).connect(context.destination);
  source.start(now, entry.onsets[fretSemitone(string, fret)], AMP_LENGTH);
  return () => { gain.gain.setTargetAtTime(0.0001, context.currentTime, 0.012); source.stop(context.currentTime + 0.06); };
}

function playSample(string, fret, volume) {
  const entry = samplers.get(instrument);
  if (!entry?.ready) return false;
  sampled.get(string)?.();
  if (entry.buffer) { sampled.set(string, playAmp(entry, string, fret, volume)); return true; }
  // MIDI 40 = E2(6번줄 개방현)
  const stop = entry.player.start({ note: 40 + fretSemitone(string, fret), velocity: Math.round(70 + volume * 50) });
  sampled.set(string, stop);
  return true;
}

export function playFret(string, fret, volume = 0.6) {
  const context = getContext();
  if (!context) return;
  if (instrument !== 'synth' && playSample(string, fret, volume)) return;
  const frequency = fretFrequency(string, fret);
  const { buffer, period } = pluckBuffer(context, frequency);
  // 다음 샘플과 평균을 내므로 되먹임 지연이 반 샘플 짧아져 실제 주기는 period - 0.5
  const naturalFrequency = context.sampleRate / (period - 0.5);

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = frequency / naturalFrequency;
  const tone = context.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = Math.min(6000, frequency * 12);
  const gain = context.createGain();
  const now = context.currentTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2);
  source.connect(tone).connect(gain).connect(context.destination);

  const before = ringing.get(string);
  if (before) {
    before.gain.gain.cancelScheduledValues(now);
    before.gain.gain.setTargetAtTime(0.0001, now, 0.015);
    before.source.stop(now + 0.08);
  }
  ringing.set(string, { source, gain });
  source.onended = () => { if (ringing.get(string)?.source === source) ringing.delete(string); };
  source.start(now);
  source.stop(now + 2.1);
}
