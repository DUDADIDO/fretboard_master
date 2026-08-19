import { useCallback, useEffect, useMemo, useState } from 'react';
import { BASIC_MAX_FRET } from '../../utils/fretboard.js';
import { canonicalNote, getNotePool } from '../../utils/notes.js';

const SEQUENCE = [6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6];

export function useNotePractice(mode, board, noteTypes) {
  const [oneString, setOneString] = useState(1);
  const [multiStrings, setMultiStrings] = useState([1, 2, 3, 4, 5, 6]);
  const [target, setTarget] = useState('C');
  const [targetString, setTargetString] = useState(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [found, setFound] = useState(new Set());
  const [wrongKey, setWrongKey] = useState(null);

  const pool = useMemo(() => getNotePool(noteTypes), [noteTypes]);
  const startQuiz = useCallback((keepSequence = false) => {
    const nextTarget = pool[Math.floor(Math.random() * pool.length)];
    setTarget(nextTarget);
    setFound(new Set());
    setWrongKey(null);
    if (mode === 'ALL') setTargetString(null);
    if (mode === 'ONE') setTargetString(oneString);
    if (mode === 'MULTI') setTargetString(multiStrings[Math.floor(Math.random() * multiStrings.length)] ?? 1);
    if (mode === 'SEQ') {
      const nextIndex = keepSequence ? sequenceIndex : 0;
      setSequenceIndex(nextIndex);
      setTargetString(SEQUENCE[nextIndex]);
    }
  }, [mode, multiStrings, oneString, pool, sequenceIndex]);

  useEffect(() => { startQuiz(); }, [mode, oneString, multiStrings, pool]); // eslint-disable-line react-hooks/exhaustive-deps

  const targets = useMemo(() => board.filter((node) =>
    node.fret <= BASIC_MAX_FRET &&
    (targetString == null || node.string === targetString) &&
    node.note === canonicalNote(target)), [board, target, targetString]);

  const click = useCallback((node) => {
    if (node.fret > BASIC_MAX_FRET || (targetString != null && node.string !== targetString) || found.has(node.key)) return;
    if (node.note !== canonicalNote(target)) {
      setWrongKey(node.key);
      window.setTimeout(() => setWrongKey((key) => key === node.key ? null : key), 500);
      return;
    }
    setFound((previous) => new Set(previous).add(node.key));
  }, [found, target, targetString]);

  useEffect(() => {
    if (!targets.length || found.size < targets.length) return undefined;
    const timer = window.setTimeout(() => {
      if (mode === 'SEQ') {
        const nextIndex = (sequenceIndex + 1) % SEQUENCE.length;
        if (nextIndex === 0) startQuiz();
        else { setSequenceIndex(nextIndex); setTargetString(SEQUENCE[nextIndex]); setFound(new Set()); }
      } else startQuiz();
    }, 700);
    return () => window.clearTimeout(timer);
  }, [found.size, mode, sequenceIndex, startQuiz, targets.length]);

  const activeStrings = mode === 'ALL' ? [1, 2, 3, 4, 5, 6] : [targetString];
  return {
    target, targetString, found, wrongKey, click, oneString, setOneString,
    multiStrings, setMultiStrings, activeStrings,
    description: mode === 'ALL' ? '0–12프렛 전체에서 같은 음을 모두 찾으세요' : `${targetString}번 줄에서 같은 음을 모두 찾으세요`,
    status: `${mode === 'SEQ' ? `${sequenceIndex + 1}/12 · ` : ''}남은 ${Math.max(0, targets.length - found.size)}`,
  };
}
