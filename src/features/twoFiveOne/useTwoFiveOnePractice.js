import { useCallback, useEffect, useMemo, useState } from 'react';
import { getChordToneHint } from '../../utils/chords.js';
import { isSamePitchClass } from '../../utils/notes.js';
import { CHART_KEYS, getSweepSequence, getTwoFiveOne, GUIDE_DEGREES, SWEEP_DIRECTIONS } from '../../utils/twoFiveOne.js';

const ALL_STRINGS = [1, 2, 3, 4, 5, 6];
export const CHORD_ROMANS = ['ii', 'V', 'I'];

export function useTwoFiveOnePractice() {
  const [practice, setPractice] = useState('SWEEP');
  const [position, setPosition] = useState(5);
  const [width, setWidth] = useState(4);
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
  const chordTones = useMemo(() => toneSet === 'GUIDE' ? chord.tones.filter((tone) => GUIDE_DEGREES.includes(tone.degree)) : chord.tones, [chord, toneSet]);
  // 포지션 훑기: 정해진 프렛 범위 안의 코드톤을 6번줄↔1번줄 음높이 순서로 전부 친다.
  const sweep = practice === 'SWEEP';
  const lastFret = position + width - 1;
  const tones = useMemo(() => sweep ? getSweepSequence(chordTones, position, width, direction) : chordTones, [chordTones, direction, position, sweep, width]);
  const activeStrings = sweep || string === 0 ? ALL_STRINGS : [string];
  const inPosition = useCallback((node) => !sweep || (node.fret >= position && node.fret <= lastFret), [lastFret, position, sweep]);

  const resetChord = useCallback(() => { setStep(0); setRootFret(null); setFound([]); setWrongKey(null); }, []);
  const restart = useCallback(() => { setChordIndex(0); resetChord(); }, [resetChord]);
  useEffect(restart, [key, string, toneSet, keyOrder, chordFilter, practice, position, width, direction, restart]);
  // 출제 키에서 빠진 키에 머물러 있으면 차트 순서상 첫 출제 키로 옮긴다.
  const usesPool = keyOrder !== 'FIXED';
  useEffect(() => {
    if (usesPool && !keyPool.includes(key)) setKey(CHART_KEYS.find((item) => keyPool.includes(item)));
  }, [key, keyPool, usesPool]);

  const nextKey = useCallback(() => {
    const pool = CHART_KEYS.filter((item) => keyPool.includes(item));
    if (keyOrder === 'FIXED' || pool.length === 1) { restart(); return; }
    if (keyOrder === 'CHART') setKey((value) => {
      const start = CHART_KEYS.indexOf(value);
      return CHART_KEYS.map((_, offset) => CHART_KEYS[(start + offset + 1) % CHART_KEYS.length]).find((item) => keyPool.includes(item));
    });
    else setKey((value) => {
      const others = pool.filter((item) => item !== value);
      return others[Math.floor(Math.random() * others.length)];
    });
  }, [keyOrder, keyPool, restart]);

  // 최소 하나는 남겨 둔다.
  const toggleIn = (setter) => (value) => setter((current) => current.includes(value) ? (current.length === 1 ? current : current.filter((item) => item !== value)) : [...current, value]);
  const toggleChord = useCallback(toggleIn(setChordFilter), []); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleKey = useCallback(toggleIn(setKeyPool), []); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceChord = useCallback(() => {
    if (chordIndex < lastIndex) { setChordIndex(chordIndex + 1); resetChord(); }
    else nextKey();
  }, [chordIndex, lastIndex, nextKey, resetChord]);

  const click = useCallback((node) => {
    if (!activeStrings.includes(node.string) || !inPosition(node) || step >= tones.length) return;
    if (!sweep && found.some((item) => item.key === node.key)) return;
    const expected = tones[step];
    // 훑기는 순서가 핵심이라 같은 음이라도 다음 차례 위치가 아니면 틀린 것으로 본다.
    if (sweep ? node.key !== expected.key : !isSamePitchClass(node.note, expected.note)) {
      setWrongKey(node.key); window.setTimeout(() => setWrongKey((value) => value === node.key ? null : value), 500); return;
    }
    if (expected.degree === '1') setRootFret(node.fret);
    const entry = { key: node.key, degree: expected.degree };
    // 왕복에서 내려오기 시작하면 올라갈 때 표시를 지우고 새로 칠한다.
    const turning = sweep && expected.pass === 1 && tones[step - 1]?.pass === 0;
    setFound((previous) => turning ? [entry] : [...previous, entry]);
    setStep(step + 1);
    if (step === tones.length - 1) window.setTimeout(advanceChord, 850);
  }, [activeStrings, advanceChord, found, inPosition, step, sweep, tones]);

  const complete = step >= tones.length;
  const current = tones[Math.min(step, tones.length - 1)];
  const where = string === 0 ? '아무 줄에서' : `${string}번 줄에서`;
  const name = showNames ? ` (${current.name})` : '';
  const ask = sweep ? `${position}–${lastFret}프렛 ${SWEEP_DIRECTIONS[direction]} · 다음 ${current.degree}${name}` : `${where} ${current.degree}${name}를 찾으세요`;
  const hint = sweep ? '포지션 밖으로 손을 옮기지 말고, 정한 방향으로 코드톤을 빠짐없이 순서대로 누르세요.' : complete || rootFret == null || string === 0 ? '루트를 찾은 뒤 같은 줄 기준으로 힌트가 표시됩니다.' : getChordToneHint(rootFret, string, current.degree);
  return {
    practice, setPractice, sweep, position, setPosition, width, setWidth, direction, setDirection, lastFret, inPosition,
    keyOrder, setKeyOrder, key, setKey, string, setString, toneSet, setToneSet, showNames, setShowNames,
    chordFilter, toggleChord, keyPool, setKeyPool, toggleKey, usesPool,
    progression, activeChords, chord, chordIndex, tones, step, found, wrongKey, click, activeStrings, complete, hint,
    target: complete ? `${chord.symbol} ✓` : `${chord.symbol} · ${current.degree}`,
    description: complete ? (chordIndex < lastIndex ? '다음 코드로 넘어갑니다' : '키 완성 · 다음 키를 준비합니다') : `${key} 키 ${chord.roman} · ${ask}`,
    status: `${chordIndex + 1}/${activeChords.length}`,
  };
}
