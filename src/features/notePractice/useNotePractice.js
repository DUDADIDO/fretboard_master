import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BASIC_MAX_FRET } from '../../utils/fretboard.js';
import { canonicalNote, getNotePool } from '../../utils/notes.js';
import { dueCount, gradeFor, pickNext, review } from '../../utils/srs.js';

const SEQUENCE = [6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6];

// weakReview: 약점 복습(FSRS)으로 다음 문제를 고를지. 기록은 켜고 끔과 상관없이 남긴다(6→1→6 순차는 제외).
export function useNotePractice(mode, board, noteTypes, weakReview = false) {
  const [oneString, setOneString] = useState(1);
  const [multiStrings, setMultiStrings] = useState([1, 2, 3, 4, 5, 6]);
  const [target, setTarget] = useState('C');
  const [targetString, setTargetString] = useState(null);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [found, setFound] = useState(new Set());
  const [wrongKey, setWrongKey] = useState(null);

  const pool = useMemo(() => getNotePool(noteTypes), [noteTypes]);
  // 문제 하나 = "음 @ 줄"(전체 줄은 all). 이 단위로 맞힌 기록을 남긴다.
  const cardIds = useMemo(() => {
    const strings = mode === 'ALL' ? ['all'] : mode === 'ONE' ? [oneString] : mode === 'MULTI' ? multiStrings : [];
    return strings.flatMap((string) => pool.map((note) => `note:${note}@${string}`));
  }, [mode, multiStrings, oneString, pool]);
  const attempt = useRef({ id: null, started: 0, mistakes: 0 });
  const startQuiz = useCallback((keepSequence = false) => {
    let nextTarget = pool[Math.floor(Math.random() * pool.length)];
    let nextString = mode === 'ONE' ? oneString : mode === 'MULTI' ? (multiStrings[Math.floor(Math.random() * multiStrings.length)] ?? 1) : null;
    if (weakReview && cardIds.length) {
      const [note, string] = pickNext(cardIds, attempt.current.id).slice(5).split('@');
      nextTarget = note;
      nextString = string === 'all' ? null : Number(string);
    }
    attempt.current = { id: mode === 'SEQ' ? null : `note:${nextTarget}@${nextString ?? 'all'}`, started: Date.now(), mistakes: 0 };
    setTarget(nextTarget);
    setFound(new Set());
    setWrongKey(null);
    if (mode !== 'SEQ') setTargetString(nextString);
    if (mode === 'SEQ') {
      const nextIndex = keepSequence ? sequenceIndex : 0;
      setSequenceIndex(nextIndex);
      setTargetString(SEQUENCE[nextIndex]);
    }
  }, [cardIds, mode, multiStrings, oneString, pool, sequenceIndex, weakReview]);

  useEffect(() => { startQuiz(); }, [mode, oneString, multiStrings, pool, weakReview]); // eslint-disable-line react-hooks/exhaustive-deps

  const targets = useMemo(() => board.filter((node) =>
    node.fret <= BASIC_MAX_FRET &&
    (targetString == null || node.string === targetString) &&
    node.note === canonicalNote(target)), [board, target, targetString]);

  const click = useCallback((node) => {
    if (node.fret > BASIC_MAX_FRET || (targetString != null && node.string !== targetString) || found.has(node.key)) return;
    if (node.note !== canonicalNote(target)) {
      attempt.current.mistakes += 1;
      setWrongKey(node.key);
      window.setTimeout(() => setWrongKey((key) => key === node.key ? null : key), 500);
      return;
    }
    setFound((previous) => new Set(previous).add(node.key));
  }, [found, target, targetString]);

  useEffect(() => {
    if (!targets.length || found.size < targets.length) return undefined;
    // 다 찾았으면 걸린 시간(한 위치당)과 실수로 점수를 매겨 기록한다.
    const { id, started, mistakes } = attempt.current;
    if (id) { review(id, gradeFor({ mistakes, secondsPerAnswer: (Date.now() - started) / 1000 / targets.length })); attempt.current.id = null; }
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
    status: `${mode === 'SEQ' ? `${sequenceIndex + 1}/12 · ` : ''}${weakReview && mode !== 'SEQ' ? `복습 대기 ${dueCount(cardIds)} · ` : ''}남은 ${Math.max(0, targets.length - found.size)}`,
  };
}
