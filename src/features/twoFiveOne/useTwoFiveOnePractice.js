import { useCallback, useEffect, useMemo, useState } from 'react';
import { getChordToneHint } from '../../utils/chords.js';
import { isSamePitchClass } from '../../utils/notes.js';
import { CHART_KEYS, getHandPath, getTwoFiveOne, GUIDE_DEGREES, nextPositionOffset, SWEEP_DIRECTIONS } from '../../utils/twoFiveOne.js';

const ALL_STRINGS = [1, 2, 3, 4, 5, 6];
export const CHORD_ROMANS = ['ii', 'V', 'I'];

export function useTwoFiveOnePractice() {
  const [practice, setPractice] = useState('SWEEP');
  // 포지션 = 한 손에 잡히는 프렛 범위. 자동 이동을 켜면 오프셋만큼 위로 옮겨 간다.
  const [rangeStart, setRangeStart] = useState(5);
  const [rangeEnd, setRangeEnd] = useState(8);
  const [shift, setShift] = useState('OFF');
  const [shiftBy, setShiftBy] = useState(2);
  const [offset, setOffset] = useState(0);
  const [keysDone, setKeysDone] = useState(0);
  const [direction, setDirection] = useState('UP');
  const [keyOrder, setKeyOrder] = useState('CHART');
  const [key, setKey] = useState('C');
  const [string, setString] = useState(6);
  const [toneSet, setToneSet] = useState('ALL');
  const [showNames, setShowNames] = useState(true);
  const [chordFilter, setChordFilter] = useState(CHORD_ROMANS);
  const [keyPool, setKeyPool] = useState(CHART_KEYS);
  const [chordIndex, setChordIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [rootFret, setRootFret] = useState(null);
  const [found, setFound] = useState([]);
  const [wrongKey, setWrongKey] = useState(null);

  const progression = useMemo(() => getTwoFiveOne(key), [key]);
  // 출제 코드로 고른 것만 ii → V → I 순서를 유지한 채 연습한다.
  const activeChords = useMemo(() => progression.filter((item) => chordFilter.includes(item.roman)), [chordFilter, progression]);
  const lastIndex = activeChords.length - 1;
  const chord = activeChords[Math.min(chordIndex, lastIndex)];
  // 가이드톤만 연습해도 기준이 되는 루트는 항상 포함한다.
  const chordTones = useMemo(() => toneSet === 'GUIDE' ? chord.tones.filter((tone) => tone.degree === '1' || GUIDE_DEGREES.includes(tone.degree)) : chord.tones, [chord, toneSet]);
  // 포지션 훑기: 시작 위치 근처 루트에서 출발해 줄마다 두 음씩 1→3→5→7→1… 이어 간다.
  // 줄을 넘어갈 때마다 손이 진행 방향으로 조금씩 옮겨 간다.
  const sweep = practice === 'SWEEP';
  const position = rangeStart + offset;
  const lastFret = rangeEnd + offset;
  const width = lastFret - position + 1;
  const tones = useMemo(() => sweep ? getHandPath(chordTones, position, direction) : chordTones, [chordTones, direction, position, sweep, width]);
  const activeStrings = sweep || string === 0 ? ALL_STRINGS : [string];
  const hand = sweep ? tones[Math.min(step, tones.length - 1)]?.hand ?? [position, lastFret] : null;

  const resetChord = useCallback(() => { setStep(0); setRootFret(null); setFound([]); setWrongKey(null); }, []);
  const restart = useCallback(() => { setChordIndex(0); resetChord(); }, [resetChord]);
  useEffect(restart, [key, string, toneSet, keyOrder, chordFilter, practice, position, width, direction, restart]);
  useEffect(() => { setOffset(0); setKeysDone(0); }, [rangeStart, rangeEnd, shift, shiftBy, keyOrder, keyPool, practice]);
  // 시작 프렛을 바꾸면 폭은 유지한다.
  const moveStart = useCallback((value) => {
    setRangeStart(value);
    setRangeEnd((end) => Math.min(24, value + Math.max(1, end - rangeStart)));
  }, [rangeStart]);
  // 손 위치 막대를 끈 곳을 새 시작 위치로. 루트는 그 근처 루트로 맞춰진다.
  const setRange = useCallback((start) => { setOffset(0); setRangeStart(Math.min(22, Math.max(0, start))); }, []);
  const setSpan = useCallback((span) => setRangeEnd(Math.min(24, rangeStart + span - 1)), [rangeStart]);
  // 출제 키에서 빠진 키에 머물러 있으면 차트 순서상 첫 출제 키로 옮긴다.
  const usesPool = keyOrder !== 'FIXED';
  useEffect(() => {
    if (usesPool && !keyPool.includes(key)) setKey(CHART_KEYS.find((item) => keyPool.includes(item)));
  }, [key, keyPool, usesPool]);

  const nextKey = useCallback(() => {
    const pool = CHART_KEYS.filter((item) => keyPool.includes(item));
    const done = keysDone + 1;
    setKeysDone(done);
    const cycleSize = keyOrder === 'FIXED' ? 1 : pool.length;
    if (sweep && (shift === 'KEY' || (shift === 'CYCLE' && done % cycleSize === 0))) setOffset((value) => nextPositionOffset(value, shiftBy, rangeEnd));
    if (keyOrder === 'FIXED' || pool.length === 1) { restart(); return; }
    if (keyOrder === 'CHART') setKey((value) => {
      const start = CHART_KEYS.indexOf(value);
      return CHART_KEYS.map((_, offset) => CHART_KEYS[(start + offset + 1) % CHART_KEYS.length]).find((item) => keyPool.includes(item));
    });
    else setKey((value) => {
      const others = pool.filter((item) => item !== value);
      return others[Math.floor(Math.random() * others.length)];
    });
  }, [keyOrder, keyPool, keysDone, rangeEnd, restart, shift, shiftBy, sweep]);

  // 최소 하나는 남겨 둔다.
  const toggleIn = (setter) => (value) => setter((current) => current.includes(value) ? (current.length === 1 ? current : current.filter((item) => item !== value)) : [...current, value]);
  const toggleChord = useCallback(toggleIn(setChordFilter), []); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleKey = useCallback(toggleIn(setKeyPool), []); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceChord = useCallback(() => {
    if (chordIndex < lastIndex) { setChordIndex(chordIndex + 1); resetChord(); }
    else nextKey();
  }, [chordIndex, lastIndex, nextKey, resetChord]);

  const click = useCallback((node) => {
    if (!activeStrings.includes(node.string) || step >= tones.length) return;
    if (!sweep && found.some((item) => item.key === node.key)) return;
    const expected = tones[step];
    // 훑기는 순서가 핵심이라 같은 음이라도 다음 차례 위치가 아니면 틀린 것으로 본다.
    if (sweep ? node.key !== expected.key : !isSamePitchClass(node.note, expected.note)) {
      setWrongKey(node.key); window.setTimeout(() => setWrongKey((value) => value === node.key ? null : value), 500); return;
    }
    if (expected.degree === '1') setRootFret(node.fret);
    const entry = { key: node.key, degree: expected.degree, anchor: expected.degree === '1' };
    // 왕복에서 내려오기 시작하면 올라갈 때 표시를 지우고 새로 칠한다. 기준인 루트는 남긴다.
    const turning = sweep && expected.pass === 1 && tones[step - 1]?.pass === 0;
    setFound((previous) => turning ? [...previous.filter((item) => item.anchor), entry] : [...previous, entry]);
    setStep(step + 1);
    if (step === tones.length - 1) window.setTimeout(advanceChord, 850);
  }, [activeStrings, advanceChord, found, step, sweep, tones]);

  const complete = step >= tones.length;
  const current = tones[Math.min(step, tones.length - 1)];
  const where = string === 0 ? '아무 줄에서' : `${string}번 줄에서`;
  const name = showNames ? ` (${current.name})` : '';
  const ask = !sweep ? `${where} ${current.degree}${name}를 찾으세요`
    : step === 0 ? `${SWEEP_DIRECTIONS[direction]} · 6번줄 루트 1${name}에서 시작`
      : `${SWEEP_DIRECTIONS[direction]} · 손 ${hand[0]}–${hand[1]}프렛 · 다음 ${current.degree}${name}`;
  const hint = sweep ? '루트에서 시작해 줄마다 두 음씩 1→3→5→7→1… 이어 가세요. 줄을 넘어갈 때마다 손이 진행 방향으로 조금씩 옮겨 가요.' : complete || rootFret == null || string === 0 ? '루트를 찾은 뒤 같은 줄 기준으로 힌트가 표시됩니다.' : getChordToneHint(rootFret, string, current.degree);
  return {
    practice, setPractice, sweep, position, lastFret, width, rangeStart, rangeEnd, moveStart, setRangeEnd, setSpan, setRange, shift, setShift, shiftBy, setShiftBy, offset,
    direction, setDirection, hand,
    keyOrder, setKeyOrder, key, setKey, string, setString, toneSet, setToneSet, showNames, setShowNames,
    chordFilter, setChordFilter, toggleChord, keyPool, setKeyPool, toggleKey, usesPool,
    progression, activeChords, chord, chordIndex, tones, step, found, wrongKey, click, activeStrings, complete, hint,
    target: complete ? `${chord.symbol} ✓` : `${chord.symbol} · ${current.degree}`,
    description: complete ? (chordIndex < lastIndex ? '다음 코드로 넘어갑니다' : '키 완성 · 다음 키를 준비합니다') : `${key} 키 ${chord.roman} · ${ask}`,
    status: `${chordIndex + 1}/${activeChords.length}`,
  };
}
