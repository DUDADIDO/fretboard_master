import { useCallback, useEffect, useMemo, useState } from 'react';
import { getChordToneHint } from '../../utils/chords.js';
import { isSamePitchClass } from '../../utils/notes.js';
import { CHART_KEYS, getTwoFiveOne, GUIDE_DEGREES } from '../../utils/twoFiveOne.js';

const ALL_STRINGS = [1, 2, 3, 4, 5, 6];

export function useTwoFiveOnePractice() {
  const [keyOrder, setKeyOrder] = useState('CHART');
  const [key, setKey] = useState('C');
  const [string, setString] = useState(6);
  const [toneSet, setToneSet] = useState('ALL');
  const [showNames, setShowNames] = useState(true);
  const [chordIndex, setChordIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [rootFret, setRootFret] = useState(null);
  const [found, setFound] = useState([]);
  const [wrongKey, setWrongKey] = useState(null);

  const progression = useMemo(() => getTwoFiveOne(key), [key]);
  const chord = progression[Math.min(chordIndex, 2)];
  const tones = useMemo(() => toneSet === 'GUIDE' ? chord.tones.filter((tone) => GUIDE_DEGREES.includes(tone.degree)) : chord.tones, [chord, toneSet]);
  const activeStrings = string === 0 ? ALL_STRINGS : [string];

  const resetChord = useCallback(() => { setStep(0); setRootFret(null); setFound([]); setWrongKey(null); }, []);
  const restart = useCallback(() => { setChordIndex(0); resetChord(); }, [resetChord]);
  useEffect(restart, [key, string, toneSet, keyOrder, restart]);

  const nextKey = useCallback(() => {
    if (keyOrder === 'CHART') setKey((value) => CHART_KEYS[(Math.max(0, CHART_KEYS.indexOf(value)) + 1) % CHART_KEYS.length]);
    else if (keyOrder === 'RANDOM') setKey((value) => {
      const pool = CHART_KEYS.filter((item) => item !== value);
      return pool[Math.floor(Math.random() * pool.length)];
    });
    else restart();
  }, [keyOrder, restart]);

  const advanceChord = useCallback(() => {
    if (chordIndex < 2) { setChordIndex(chordIndex + 1); resetChord(); }
    else nextKey();
  }, [chordIndex, nextKey, resetChord]);

  const click = useCallback((node) => {
    if (!activeStrings.includes(node.string) || found.some((item) => item.key === node.key) || step >= tones.length) return;
    const expected = tones[step];
    if (!isSamePitchClass(node.note, expected.note)) {
      setWrongKey(node.key); window.setTimeout(() => setWrongKey((value) => value === node.key ? null : value), 500); return;
    }
    if (expected.degree === '1') setRootFret(node.fret);
    setFound((previous) => [...previous, { key: node.key, degree: expected.degree }]);
    setStep(step + 1);
    if (step === tones.length - 1) window.setTimeout(advanceChord, 850);
  }, [activeStrings, advanceChord, found, step, tones]);

  const complete = step >= tones.length;
  const current = tones[Math.min(step, tones.length - 1)];
  const where = string === 0 ? '아무 줄에서' : `${string}번 줄에서`;
  const hint = complete || rootFret == null || string === 0 ? '루트를 찾은 뒤 같은 줄 기준으로 힌트가 표시됩니다.' : getChordToneHint(rootFret, string, current.degree);
  return {
    keyOrder, setKeyOrder, key, setKey, string, setString, toneSet, setToneSet, showNames, setShowNames,
    progression, chord, chordIndex, tones, step, found, wrongKey, click, activeStrings, complete, hint,
    target: complete ? `${chord.symbol} ✓` : `${chord.symbol} · ${current.degree}`,
    description: complete ? (chordIndex < 2 ? '다음 코드로 넘어갑니다' : '키 완성 · 다음 키를 준비합니다') : `${key} 키 ${chord.roman} · ${where} ${current.degree}${showNames ? ` (${current.name})` : ''}를 찾으세요`,
    status: `${chordIndex + 1}/3`,
  };
}
