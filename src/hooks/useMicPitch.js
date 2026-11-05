import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';
import { NOTES } from '../utils/notes.js';
import { createNoteTracker } from '../utils/noteTracker.js';

// 마이크로 기타 소리를 듣고 음높이를 알아낸다(pitchy의 McLeod 피치 검출).
// 음높이는 E2(6번줄 개방현)=0 기준 반음 수. 친 음·틀린 음을 가려내는 건 noteTracker가 맡는다.
const E2 = 440 * 2 ** (-29 / 12);
const BUFFER = 4096; // 6번줄 E2(82Hz)도 안정적으로 잡히는 길이
const MIN_CLARITY = 0.9;
const MIN_LEVEL = 0.008; // RMS. 이보다 작으면 조용한 것으로 본다

export const semitoneToName = (semitone) => `${NOTES[(((semitone + 4) % 12) + 12) % 12]}${Math.floor((semitone + 4) / 12) + 2}`;

// deviceId: 오디오 인터페이스 입력 등 특정 입력 장치. 비우면 기본 마이크.
// onNote: 친 음을 알림(처리했으면 true를 돌려준다). onMiss: 처리되지 않은 음이 새로 친 음으로 확인되면 알림.
export function useMicPitch(onNote, deviceId = '', onMiss = null) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [heard, setHeard] = useState(null); // { semitone, name, cents }
  const [level, setLevel] = useState(0);
  const [devices, setDevices] = useState([]); // 권한을 받은 뒤에야 장치 이름이 보인다
  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((device) => device.kind === 'audioinput').map((device, index) => ({ id: device.deviceId, label: device.label || `입력 ${index + 1}` })));
    } catch { /* 목록을 못 받으면 기본 장치만 */ }
  }, []);
  const onNoteRef = useRef(onNote);
  onNoteRef.current = onNote;
  const onMissRef = useRef(onMiss);
  onMissRef.current = onMiss;
  const engine = useRef(null);

  const stop = useCallback(() => {
    const current = engine.current;
    engine.current = null;
    if (!current) return;
    cancelAnimationFrame(current.frame);
    current.stream.getTracks().forEach((track) => track.stop());
    current.context.close().catch(() => {});
    setListening(false); setHeard(null); setLevel(0);
  }, []);

  const start = useCallback(async () => {
    if (engine.current) return;
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) { setError('이 브라우저(또는 http 주소)에서는 마이크를 쓸 수 없어요. https로 열어 주세요.'); return; }
    try {
      // 기타 소리를 그대로 듣도록 통화용 보정(잡음 제거·자동 음량)은 끈다.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, ...(deviceId ? { deviceId: { exact: deviceId } } : {}) } });
      refreshDevices();
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = BUFFER;
      context.createMediaStreamSource(stream).connect(analyser);
      const detector = PitchDetector.forFloat32Array(BUFFER);
      const buffer = new Float32Array(BUFFER);
      const tracker = createNoteTracker({ onNote: (semitone) => onNoteRef.current?.(semitone), onMiss: (semitone) => onMissRef.current?.(semitone) });
      const state = { shown: null };
      const current = { stream, context, frame: 0, tracker };
      engine.current = current;

      const tick = () => {
        if (engine.current !== current) return;
        analyser.getFloatTimeDomainData(buffer);
        const rms = Math.sqrt(buffer.reduce((sum, value) => sum + value * value, 0) / BUFFER);
        const [pitch, clarity] = detector.findPitch(buffer, context.sampleRate);
        const valid = rms > MIN_LEVEL && clarity > MIN_CLARITY && pitch > 70 && pitch < 1400;
        setLevel(Math.min(1, rms * 12));
        const exact = valid ? 12 * Math.log2(pitch / E2) : null;
        const semitone = valid ? Math.round(exact) : null;
        tracker.frame({ now: performance.now(), rms, semitone });
        if (valid && state.shown !== semitone) { state.shown = semitone; setHeard({ semitone, name: semitoneToName(semitone), cents: Math.round((exact - semitone) * 100) }); }
        current.frame = requestAnimationFrame(tick);
      };
      current.frame = requestAnimationFrame(tick);
      setListening(true);
    } catch (reason) {
      setError(reason?.name === 'NotAllowedError' ? '마이크 권한이 거부됐어요. 주소창의 권한 설정에서 허용해 주세요.'
        : reason?.name === 'OverconstrainedError' || reason?.name === 'NotFoundError' ? '고른 입력 장치를 찾지 못했어요. 설정에서 입력 장치를 다시 골라 주세요.'
          : reason?.name === 'NotReadableError' ? '입력 장치를 다른 프로그램이 독점 중이에요(ASIO 독점 모드 등).' : '마이크를 열지 못했어요.');
      stop();
    }
  }, [deviceId, refreshDevices, stop]);
  // 켜져 있는 동안 입력 장치를 바꾸면 새 장치로 다시 연다.
  const restart = useRef(false);
  useEffect(() => {
    if (!restart.current) { restart.current = true; return; }
    if (engine.current) { stop(); start(); }
  }, [deviceId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { refreshDevices(); }, [refreshDevices]);

  useEffect(() => stop, [stop]);
  // 내 스피커 소리(오답 버저)가 다시 들어오지 않게 잠깐 듣기를 멈춘다.
  const pause = useCallback((ms) => { engine.current?.tracker.mute(performance.now() + ms); }, []);
  return { listening, start, stop, pause, toggle: () => (engine.current ? stop() : start()), error, heard, level, devices };
}
