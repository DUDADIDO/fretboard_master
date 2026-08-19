import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getThirdTargets } from '../../utils/intervals.js';
import { canonicalNote, getNotePool, isSamePitchClass, noteLabel, transpose } from '../../utils/notes.js';

export function useThirdPractice(board, noteTypes) {
  const [quality, setQuality] = useState('MAJOR');
  const [practice, setPractice] = useState('RANDOM');
  const [selectedNotes, setSelectedNotes] = useState(['C']);
  const [selectedStrings, setSelectedStrings] = useState([1, 2, 3, 4, 5, 6]);
  const [task, setTask] = useState({ note: 'C', string: 6 });
  const [phase, setPhase] = useState('ROOT');
  const [rootFret, setRootFret] = useState(null);
  const [targets, setTargets] = useState([]);
  const [found, setFound] = useState(new Set());
  const [wrongKey, setWrongKey] = useState(null);
  const sequenceRef = useRef({ queue: [], index: 0 });
  const availableNotes = useMemo(() => [...new Set(getNotePool(noteTypes).map(canonicalNote))], [noteTypes]);

  const nextTask = useCallback(() => {
    let notePool = availableNotes;
    if (practice === 'FIXED_NOTE' || practice === 'FIXED_BOTH') notePool = selectedNotes;
    let next;
    if (practice === 'SEQ') {
      if (!sequenceRef.current.queue.length || sequenceRef.current.index >= sequenceRef.current.queue.length) {
        sequenceRef.current = { queue: availableNotes.flatMap((note) => [...selectedStrings].sort((a, b) => b - a).map((string) => ({ note, string }))), index: 0 };
      }
      next = sequenceRef.current.queue[sequenceRef.current.index++];
    } else {
      next = {
        note: notePool[Math.floor(Math.random() * notePool.length)] ?? 'C',
        string: selectedStrings[Math.floor(Math.random() * selectedStrings.length)] ?? 6,
      };
    }
    setTask(next); setPhase('ROOT'); setRootFret(null); setTargets([]); setFound(new Set()); setWrongKey(null);
  }, [availableNotes, practice, selectedNotes, selectedStrings]);

  useEffect(() => { sequenceRef.current = { queue: [], index: 0 }; nextTask(); }, [quality, practice, selectedNotes, selectedStrings, availableNotes]); // eslint-disable-line react-hooks/exhaustive-deps

  const click = useCallback((node) => {
    if (phase === 'ROOT') {
      if (node.string !== task.string || !isSamePitchClass(node.note, task.note)) return markWrong(node.key, setWrongKey);
      const result = getThirdTargets(task.string, node.fret, task.note, quality);
      setRootFret(node.fret); setTargets(result.candidates); setPhase('THIRDS'); setFound(new Set());
      if (!result.candidates.length) window.setTimeout(nextTask, 500);
      return;
    }
    if (!targets.some((target) => target.key === node.key)) return markWrong(node.key, setWrongKey);
    setFound((previous) => new Set(previous).add(node.key));
  }, [nextTask, phase, quality, targets, task]);

  useEffect(() => {
    if (phase !== 'THIRDS' || !targets.length || found.size < targets.length) return undefined;
    const timer = window.setTimeout(nextTask, 800);
    return () => window.clearTimeout(timer);
  }, [found.size, nextTask, phase, targets.length]);

  const targetNote = transpose(task.note, quality === 'MINOR' ? 3 : 4);
  return {
    quality, setQuality, practice, setPractice, selectedNotes, setSelectedNotes, selectedStrings, setSelectedStrings,
    task, phase, rootFret, targets, found, wrongKey, click,
    target: phase === 'ROOT' ? `${task.string}번 줄 · ${noteLabel(task.note)}` : `${noteLabel(task.note)} → ${noteLabel(targetNote)}`,
    description: phase === 'ROOT' ? '1단계 · 지정된 줄에서 루트를 찾으세요' : '2단계 · 같은 줄과 양쪽 인접 줄의 공식 3도 위치를 찾으세요',
    status: phase === 'ROOT' ? `${quality === 'MAJOR' ? '메이저' : '마이너'} 3도 · 루트 찾기` : `남은 ${targets.length - found.size} · ${targets.map((item) => item.label).join(' / ')}`,
    activeStrings: phase === 'ROOT' ? [task.string] : [...new Set([task.string, ...targets.map((item) => item.string)])],
  };
}

function markWrong(key, setter) {
  setter(key);
  window.setTimeout(() => setter((current) => current === key ? null : current), 500);
}
