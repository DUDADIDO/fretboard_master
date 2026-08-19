import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPentatonicTargets, PENTA_STEPS } from '../../utils/pentatonic.js';
import { noteLabel, transpose } from '../../utils/notes.js';

const ORDER = [6, 5, 4, 3, 2, 1];
const shuffled = () => [...ORDER].sort(() => Math.random() - 0.5);

export function usePentatonicPractice() {
  const [root, setRoot] = useState('E');
  const [quality, setQuality] = useState('MAJOR');
  const [position, setPosition] = useState(1);
  const [practice, setPractice] = useState('GUIDED');
  const [keepPrevious, setKeepPrevious] = useState(true);
  const [preview, setPreview] = useState(false);
  const [hint, setHint] = useState(false);
  const [found, setFound] = useState(new Set());
  const [wrongKey, setWrongKey] = useState(null);
  const [stringOrder, setStringOrder] = useState(ORDER);
  const [stringIndex, setStringIndex] = useState(0);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [complete, setComplete] = useState(false);
  const targets = useMemo(() => getPentatonicTargets(root, quality, position), [position, quality, root]);
  const guided = useMemo(() => [...targets].sort((a, b) => b.string - a.string || a.fret - b.fret), [targets]);
  const currentString = practice === 'GUIDED' ? guided[Math.min(guidedIndex, 11)]?.string ?? 6 : stringOrder[stringIndex];
  const currentTargets = useMemo(() => practice === 'GUIDED' ? [guided[Math.min(guidedIndex, 11)]] : practice === 'FULL' ? targets : targets.filter((target) => target.string === currentString), [currentString, guided, guidedIndex, practice, targets]);

  const reset = useCallback(() => {
    setFound(new Set()); setWrongKey(null); setPreview(false); setHint(false); setComplete(false); setGuidedIndex(0); setStringIndex(0);
    setStringOrder(practice === 'RANDOM_STRING' ? shuffled() : ORDER);
  }, [practice]);
  useEffect(reset, [root, quality, position, practice, reset]);

  const click = useCallback((node) => {
    if (preview || complete || found.has(node.key)) return;
    const target = currentTargets.find((item) => item?.key === node.key);
    if (!target) {
      setWrongKey(node.key); window.setTimeout(() => setWrongKey((key) => key === node.key ? null : key), 550); return;
    }
    const nextFound = new Set(found).add(node.key); setFound(nextFound); setHint(false);
    if (practice === 'GUIDED') {
      if (guidedIndex < guided.length - 1) {
        const nextIndex = guidedIndex + 1;
        setGuidedIndex(nextIndex);
        setStringIndex(Math.max(0, ORDER.indexOf(guided[nextIndex].string)));
      } else setComplete(true);
    } else if (practice === 'FULL') {
      if (nextFound.size === targets.length) setComplete(true);
    } else if (currentTargets.every((item) => nextFound.has(item.key))) {
      if (stringIndex < stringOrder.length - 1) setStringIndex(stringIndex + 1); else setComplete(true);
    }
  }, [complete, currentTargets, found, guided.length, guidedIndex, practice, preview, stringIndex, stringOrder.length, targets.length]);

  const wanted = currentTargets.find((item) => item && !found.has(item.key)) ?? currentTargets[0];
  const completedStrings = stringOrder.slice(0, stringIndex);
  const visibleFound = new Set([...found].filter((key) => {
    if (complete || practice === 'FULL' || keepPrevious) return true;
    return Number(key.split('-')[0]) === currentString;
  }));
  const activeStrings = preview || practice === 'FULL' ? ORDER : keepPrevious ? [...completedStrings, currentString] : [currentString];
  const pair = quality === 'MAJOR' ? `${noteLabel(transpose(root, -3))} 마이너` : `${noteLabel(transpose(root, 3))} 메이저`;
  return {
    root, setRoot, quality, setQuality, position, setPosition, practice, setPractice, keepPrevious, setKeepPrevious,
    preview, setPreview, hint, setHint, reset, targets, found: visibleFound, wrongKey, click, complete, currentString, activeStrings,
    wanted, hintKey: hint ? wanted?.key : null,
    target: `${noteLabel(root)} ${quality === 'MAJOR' ? '메이저' : '마이너'} · P${position}`,
    description: complete ? '완료 · 전체 모양을 확인하세요' : practice === 'FULL' ? '현재 포지션의 12개 위치를 모두 찾으세요' : `${currentString}번 줄에서 ${practice === 'GUIDED' ? `${wanted?.degree} (${noteLabel(wanted?.note)})` : '두 음'}을 찾으세요`,
    status: complete ? '완료 · 다시하기를 눌러 반복하세요' : `${practice === 'GUIDED' ? `${guidedIndex + 1}/12` : `${found.size}/12`} · 나란한조 ${pair}`,
    degrees: PENTA_STEPS[quality].map((item) => item.degree).join(' · '),
  };
}
