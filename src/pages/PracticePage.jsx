import { Navigate, useParams } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { MODES, LEGACY_MODE } from '../constants/modes.js';
import { createFretboard, BASIC_MAX_FRET } from '../utils/fretboard.js';
import { noteLabel } from '../utils/notes.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useNotePractice } from '../features/notePractice/useNotePractice.js';
import { useThirdPractice } from '../features/thirdPractice/useThirdPractice.js';
import { usePentatonicPractice } from '../features/pentatonic/usePentatonicPractice.js';
import { useChordTonePractice } from '../features/chordTone/useChordTonePractice.js';
import DesktopLayout from '../components/layout/DesktopLayout.jsx';
import MobileLayout from '../components/layout/MobileLayout.jsx';
import RotateDevice from '../components/layout/RotateDevice.jsx';
import ModeNavigation from '../components/ModeNavigation.jsx';
import QuizHeader from '../components/QuizHeader.jsx';
import Fretboard from '../components/fretboard/Fretboard.jsx';
import GlobalControls from '../components/controls/GlobalControls.jsx';
import StringSelector from '../components/controls/StringSelector.jsx';
import ThirdControls from '../components/controls/ThirdControls.jsx';
import PentatonicControls from '../components/controls/PentatonicControls.jsx';
import ChordToneControls from '../components/controls/ChordToneControls.jsx';
import ChordDegreeProgress from '../components/ChordDegreeProgress.jsx';

const board = createFretboard();

export default function PracticePage() {
  const { mode: routeMode } = useParams();
  const valid = MODES.some((item) => item.id === routeMode);
  const mode = valid ? routeMode : 'all';
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [showFrets, setShowFrets] = useState(true);
  const [noteTypes, setNoteTypes] = useState({ natural: true, sharp: false, flat: false });
  const base = useNotePractice(LEGACY_MODE[mode] ?? 'ALL', board, noteTypes);
  const third = useThirdPractice(board, noteTypes);
  const penta = usePentatonicPractice();
  const chord = useChordTonePractice(noteTypes);

  const state = mode === 'third' ? third : mode === 'pentatonic' ? penta : mode === 'chord-tone' ? chord : base;
  const preference = noteTypes.flat && !noteTypes.sharp ? 'FLAT' : noteTypes.sharp && !noteTypes.flat ? 'SHARP' : 'BOTH';
  const modeMeta = MODES.find((item) => item.id === mode);

  const onNodeClick = useCallback((node) => state.click(node), [state]);
  const getNodeView = useCallback((node) => {
    const wrong = state.wrongKey === node.key;
    if (mode === 'third') {
      const root = third.rootFret === node.fret && third.task.string === node.string;
      const correct = root || third.found.has(node.key);
      return { disabled: !third.activeStrings.includes(node.string), wrong, correct, tone: root ? 'tone-root' : 'tone-third', label: wrong ? noteLabel(node.note, preference) : root ? '1' : third.found.has(node.key) ? (third.quality === 'MAJOR' ? '3' : 'b3') : '' };
    }
    if (mode === 'pentatonic') {
      const target = penta.targets.find((item) => item.key === node.key);
      const shown = penta.preview ? Boolean(target) : penta.found.has(node.key);
      const frets = penta.targets.map((item) => item.fret);
      const outsideWindow = node.fret < Math.min(...frets) || node.fret > Math.max(...frets);
      const currentClickable = penta.activeStrings.includes(node.string) && !outsideWindow;
      return { disabled: !currentClickable || penta.preview || penta.complete, wrong, correct: shown, hint: penta.hintKey === node.key, tone: target?.degree === '1' ? 'tone-root' : 'tone-penta', label: wrong ? noteLabel(node.note, preference) : shown ? target?.degree : '' };
    }
    if (mode === 'chord-tone') {
      const foundIndex = [...chord.found].indexOf(node.key);
      const correct = foundIndex >= 0;
      const degree = correct ? chord.tones[foundIndex]?.degree : '';
      const tone = degree === '1' ? 'tone-root' : degree?.includes('3') ? 'tone-third' : degree === '5' ? 'tone-fifth' : 'tone-seventh';
      return { disabled: node.string !== chord.string, wrong, correct, tone, label: wrong ? noteLabel(node.note, preference) : degree };
    }
    return { disabled: node.fret > BASIC_MAX_FRET || !base.activeStrings.includes(node.string), wrong, correct: base.found.has(node.key), tone: 'tone-note', label: wrong ? noteLabel(node.note, preference) : base.found.has(node.key) ? noteLabel(base.target, preference) : '' };
  }, [base, chord, mode, penta, preference, state.wrongKey, third]);

  const target = useMemo(() => mode === 'all' || mode === 'one' || mode === 'multi' || mode === 'sequence' ? noteLabel(base.target, preference) : state.target, [base.target, mode, preference, state.target]);
  const controls = (
    <section className="control-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <GlobalControls noteTypes={noteTypes} setNoteTypes={setNoteTypes} showFrets={showFrets} setShowFrets={setShowFrets} />
        <StringSelector mode={mode} oneString={base.oneString} setOneString={base.setOneString} multiStrings={base.multiStrings} setMultiStrings={base.setMultiStrings} />
      </div>
      {mode === 'third' && <ThirdControls state={third} />}
      {mode === 'pentatonic' && <PentatonicControls state={penta} />}
      {mode === 'chord-tone' && <ChordToneControls state={chord} />}
    </section>
  );
  const headerStatus = mode === 'chord-tone' ? <ChordDegreeProgress degrees={chord.tones.map((tone) => tone.degree)} step={chord.step} /> : state.status;
  const header = <QuizHeader eyebrow={modeMeta.label} target={target} description={state.description} status={headerStatus} />;
  const fretboard = <Fretboard board={board} showFrets={showFrets} activeStrings={state.activeStrings} getNodeView={getNodeView} onNodeClick={onNodeClick} />;

  if (!valid) return <Navigate to="/practice/all" replace />;
  const Layout = isMobile ? MobileLayout : DesktopLayout;
  return (
    <>
      <Layout navigation={<ModeNavigation mobile={isMobile} />} header={header} controls={controls} board={fretboard} />
      <RotateDevice />
    </>
  );
}
