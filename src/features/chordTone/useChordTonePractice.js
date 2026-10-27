import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHORDS, getChordToneHint, getChordTones } from '../../utils/chords.js';
import { getNotePool, isSamePitchClass, noteLabel, spellingPreference } from '../../utils/notes.js';

const RANDOM_SEQ = 'RANDOM_SEQ';

export function useChordTonePractice(noteTypes, preference = 'BOTH') {
  const [quality, setQuality] = useState('MAJ7');
  const [practice, setPractice] = useState('DIRECT');
  const [root, setRoot] = useState('C');
  const [string, setString] = useState(6);
  const [step, setStep] = useState(0);
  const [rootFret, setRootFret] = useState(null);
  const [found, setFound] = useState(new Set());
  const [wrongKey, setWrongKey] = useState(null);
  const rootPool = useMemo(() => getNotePool(noteTypes), [noteTypes]);
  const tones = useMemo(() => getChordTones(root, quality), [quality, root]);
  const pickRandomRoot = useCallback(() => rootPool[Math.floor(Math.random() * rootPool.length)] ?? 'C', [rootPool]);

  const reset = useCallback(() => { setStep(0); setRootFret(null); setFound(new Set()); setWrongKey(null); }, []);
  useEffect(reset, [quality, root, string, practice, reset]);
  useEffect(() => {
    if (practice !== RANDOM_SEQ) return;
    setRoot(pickRandomRoot());
    setString(6);
  }, [pickRandomRoot, practice]);

  const advanceAssignment = useCallback(() => {
    if (practice === 'RANDOM') {
      setRoot(pickRandomRoot()); setString(1 + Math.floor(Math.random() * 6));
    } else if (practice === 'STRING_SEQ') setString((value) => value === 1 ? 6 : value - 1);
    else if (practice === RANDOM_SEQ) {
      if (string > 1) setString((value) => value - 1);
      else { setString(6); setRoot(pickRandomRoot()); }
    }
    else if (practice === 'FULL_SEQ') {
      if (string > 1) setString(string - 1);
      else { setString(6); setRoot(rootPool[(Math.max(0, rootPool.indexOf(root)) + 1) % rootPool.length] ?? 'C'); }
    } else reset();
  }, [pickRandomRoot, practice, reset, root, rootPool, string]);

  const click = useCallback((node) => {
    if (node.string !== string || found.has(node.key) || step >= tones.length) return;
    const expected = tones[step];
    if (!isSamePitchClass(node.note, expected.note)) {
      setWrongKey(node.key); window.setTimeout(() => setWrongKey((key) => key === node.key ? null : key), 500); return;
    }
    if (step === 0) setRootFret(node.fret);
    setFound((previous) => new Set(previous).add(node.key));
    if (step < tones.length - 1) setStep(step + 1);
    else { setStep(tones.length); window.setTimeout(advanceAssignment, 850); }
  }, [advanceAssignment, found, step, string, tones]);

  const complete = step >= tones.length;
  const current = tones[Math.min(step, tones.length - 1)];
  const derivedPreference = spellingPreference(root, preference);
  return {
    quality, setQuality, practice, setPractice, root, setRoot, string, setString, step, rootFret, tones, found, wrongKey, click,
    target: complete ? `${noteLabel(root, preference)} ${CHORDS[quality].label} ✓` : `${noteLabel(root, preference)} ${CHORDS[quality].label} · ${current.degree}`,
    description: complete ? '코드톤 완성 · 다음 세트를 준비합니다' : `${string}번 줄에서 ${current.degree} (${noteLabel(current.note, derivedPreference)})를 찾으세요`,
    status: `${Math.min(step + 1, 4)}/4 · ${CHORDS[quality].degrees.map((degree, index) => index < step ? `${degree} ✓` : index === step ? `${degree} ●` : degree).join('  ')}`,
    hint: complete ? '완성! 실제 음정 기준으로 네 코드톤을 모두 찾았습니다.' : getChordToneHint(rootFret ?? 0, string, current.degree), activeStrings: [string], complete,
  };
}
