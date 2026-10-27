import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useMemo, useRef, useState } from 'react';
import { MODES, LEGACY_MODE, NOTE_MODES, navModeFor } from '../constants/modes.js';
import { createFretboard, BASIC_MAX_FRET } from '../utils/fretboard.js';
import { noteLabel, spellingPreference } from '../utils/notes.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useStoredState } from '../hooks/useStoredState.js';
import { playFret } from '../utils/guitarSound.js';
import { useNotePractice } from '../features/notePractice/useNotePractice.js';
import { useThirdPractice } from '../features/thirdPractice/useThirdPractice.js';
import { usePentatonicPractice } from '../features/pentatonic/usePentatonicPractice.js';
import { useChordTonePractice } from '../features/chordTone/useChordTonePractice.js';
import { useDirectPractice } from '../features/directPractice/useDirectPractice.js';
import { useTwoFiveOnePractice } from '../features/twoFiveOne/useTwoFiveOnePractice.js';
import DesktopLayout from '../components/layout/DesktopLayout.jsx';
import MobileLayout from '../components/layout/MobileLayout.jsx';
import RotateDevice from '../components/layout/RotateDevice.jsx';
import AppBar from '../components/AppBar.jsx';
import Overlay from '../components/Overlay.jsx';
import HelpDialog from '../components/HelpDialog.jsx';
import QuizHeader from '../components/QuizHeader.jsx';
import Fretboard from '../components/fretboard/Fretboard.jsx';
import GlobalControls from '../components/controls/GlobalControls.jsx';
import StringSelector from '../components/controls/StringSelector.jsx';
import ThirdControls from '../components/controls/ThirdControls.jsx';
import PentatonicControls, { PentatonicActions } from '../components/controls/PentatonicControls.jsx';
import { Field, Segmented } from '../components/controls/ControlPrimitives.jsx';
import ChordToneControls from '../components/controls/ChordToneControls.jsx';
import DirectPracticeControls from '../components/controls/DirectPracticeControls.jsx';
import TwoFiveOneControls from '../components/controls/TwoFiveOneControls.jsx';
import ChordDegreeProgress from '../components/ChordDegreeProgress.jsx';
import DirectPracticePanel from '../components/DirectPracticePanel.jsx';
import TwoFiveOneProgress from '../components/TwoFiveOneProgress.jsx';

const board = createFretboard();

export default function PracticePage() {
  const { mode: routeMode } = useParams();
  const valid = MODES.some((item) => item.id === routeMode);
  const mode = valid ? routeMode : 'all';
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [seenGuide, setSeenGuide] = useStoredState('fretmaster.seenGuide', false);
  const [helpOpen, setHelpOpen] = useState(!seenGuide);
  const [showFrets, setShowFrets] = useState(true);
  const [keepMarks, setKeepMarks] = useStoredState('fretmaster.keepMarks', true);
  const [soundOn, setSoundOn] = useStoredState('fretmaster.sound', true);
  const [flashKey, setFlashKey] = useState(null);
  const flashTimer = useRef(null);
  const [noteTypes, setNoteTypes] = useState({ natural: true, sharp: false, flat: false });
  const preference = noteTypes.flat && !noteTypes.sharp ? 'FLAT' : noteTypes.sharp && !noteTypes.flat ? 'SHARP' : 'BOTH';
  const base = useNotePractice(LEGACY_MODE[mode] ?? 'ALL', board, noteTypes);
  const third = useThirdPractice(board, noteTypes, preference);
  const penta = usePentatonicPractice(preference);
  const chord = useChordTonePractice(noteTypes, preference);
  const direct = useDirectPractice();
  const twoFive = useTwoFiveOnePractice();

  const state = mode === 'third' ? third : mode === 'pentatonic' ? penta : mode === 'chord-tone' ? chord : mode === 'two-five-one' ? twoFive : mode === 'direct' ? direct : base;
  const modeMeta = MODES.find((item) => item.id === mode);
  const navMode = navModeFor(mode);
  const isNoteMode = NOTE_MODES.includes(mode);

  const onNodeClick = useCallback((node) => {
    // 맞든 틀리든 누른 칸의 소리를 들려준다.
    if (soundOn) playFret(node.string, node.fret);
    state.click(node);
    setFlashKey(node.key);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashKey(null), 700);
  }, [soundOn, state]);
  const getModeNodeView = useCallback((node) => {
    const wrong = state.wrongKey === node.key;
    if (mode === 'third') {
      const root = third.rootFret === node.fret && third.task.string === node.string;
      const correct = root || third.found.has(node.key);
      return { disabled: !third.activeStrings.includes(node.string), wrong, correct, anchor: root, tone: root ? 'tone-root' : 'tone-third', label: wrong ? noteLabel(node.note, spellingPreference(third.task.note, preference)) : root ? '1' : third.found.has(node.key) ? (third.quality === 'MAJOR' ? '3' : 'b3') : '' };
    }
    if (mode === 'pentatonic') {
      const target = penta.targets.find((item) => item.key === node.key);
      const shown = penta.preview ? Boolean(target) : penta.found.has(node.key);
      const frets = penta.targets.map((item) => item.fret);
      const outsideWindow = node.fret < Math.min(...frets) || node.fret > Math.max(...frets);
      const currentClickable = penta.activeStrings.includes(node.string) && !outsideWindow;
      return { disabled: !currentClickable || penta.preview || penta.complete, wrong, correct: shown, hint: penta.hintKey === node.key, tone: target?.degree === '1' ? 'tone-root' : 'tone-penta', label: wrong ? noteLabel(node.note, spellingPreference(penta.root, preference)) : shown ? target?.degree : '' };
    }
    if (mode === 'chord-tone') {
      const foundIndex = [...chord.found].indexOf(node.key);
      const correct = foundIndex >= 0;
      const degree = correct ? chord.tones[foundIndex]?.degree : '';
      const tone = degree === '1' ? 'tone-root' : degree?.includes('3') ? 'tone-third' : degree === '5' ? 'tone-fifth' : 'tone-seventh';
      return { disabled: node.string !== chord.string, wrong, correct, anchor: degree === '1', tone, label: wrong ? noteLabel(node.note, spellingPreference(chord.root, preference)) : degree };
    }
    if (mode === 'two-five-one') {
      const hit = twoFive.found.find((item) => item.key === node.key);
      const degree = hit?.degree ?? '';
      const tone = degree === '1' ? 'tone-root' : degree.includes('3') ? 'tone-third' : degree === '5' ? 'tone-fifth' : 'tone-seventh';
      return { disabled: !twoFive.activeStrings.includes(node.string) || twoFive.complete, wrong, correct: Boolean(hit), anchor: degree === '1', tone, label: wrong ? noteLabel(node.note, spellingPreference(twoFive.key, preference)) : degree };
    }
    return { disabled: node.fret > BASIC_MAX_FRET || !base.activeStrings.includes(node.string), wrong, correct: base.found.has(node.key), tone: 'tone-note', label: wrong ? noteLabel(node.note, spellingPreference(base.target, preference)) : base.found.has(node.key) ? noteLabel(base.target, preference) : '' };
  }, [base, chord, mode, penta, preference, state.wrongKey, third, twoFive]);
  // 표시 유지를 끄면 방금 누른 정답만 잠깐 보여주고 이전에 찾은 위치는 숨긴다. 기준이 되는 루트(anchor)는 남긴다.
  const getNodeView = useCallback((node) => {
    const view = getModeNodeView(node);
    const revealed = keepMarks || view.anchor || node.key === flashKey || (mode === 'pentatonic' && penta.preview);
    return view.correct && !revealed ? { ...view, correct: false, label: '' } : view;
  }, [flashKey, getModeNodeView, keepMarks, mode, penta.preview]);

  const target = useMemo(() => mode === 'all' || mode === 'one' || mode === 'multi' || mode === 'sequence' ? noteLabel(base.target, preference) : state.target, [base.target, mode, preference, state.target]);
  const settings = (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-col gap-4 p-4">
        <h3 className="text-base font-semibold text-ink">{navMode.label}</h3>
        {isNoteMode && <Field label="범위"><Segmented ariaLabel="음 찾기 범위" value={mode} onChange={(id) => navigate(`/practice/${id}`)} options={NOTE_MODES.map((id) => ({ value: id, label: MODES.find((item) => item.id === id).label }))} /></Field>}
        {isNoteMode && <StringSelector mode={mode} oneString={base.oneString} setOneString={base.setOneString} multiStrings={base.multiStrings} setMultiStrings={base.setMultiStrings} />}
        {mode === 'direct' && <DirectPracticeControls state={direct} />}
        {mode === 'third' && <ThirdControls state={third} preference={preference} />}
        {mode === 'pentatonic' && <PentatonicControls state={penta} preference={preference} />}
        {mode === 'chord-tone' && <ChordToneControls state={chord} preference={preference} />}
        {mode === 'two-five-one' && <TwoFiveOneControls state={twoFive} />}
      </section>
      {mode !== 'direct' && <section className="card flex flex-col gap-4 p-4">
        <h3 className="text-base font-semibold text-ink">음 · 화면 표시</h3>
        <GlobalControls noteTypes={noteTypes} setNoteTypes={setNoteTypes} showFrets={showFrets} setShowFrets={setShowFrets} keepMarks={keepMarks} setKeepMarks={setKeepMarks} soundOn={soundOn} setSoundOn={setSoundOn} />
      </section>}
    </div>
  );
  const controls = mode === 'pentatonic' ? <section className="control-panel card"><PentatonicActions state={penta} /></section> : null;
  const headerStatus = mode === 'chord-tone' ? <ChordDegreeProgress degrees={chord.tones.map((tone) => tone.degree)} step={chord.step} /> : mode === 'two-five-one' ? <TwoFiveOneProgress progression={twoFive.activeChords} chordIndex={twoFive.chordIndex} degrees={twoFive.tones.map((tone) => tone.degree)} step={twoFive.step} total={twoFive.sweep ? twoFive.tones.length : 0} /> : state.status;
  const header = <QuizHeader eyebrow={isNoteMode ? `${navMode.label} · ${modeMeta.label}` : modeMeta.label} target={target} description={state.description} status={headerStatus} />;
  const fretboard = mode === 'direct' ? <DirectPracticePanel state={direct} /> : <Fretboard board={board} showFrets={showFrets} activeStrings={state.activeStrings} position={mode === 'two-five-one' && twoFive.sweep ? twoFive.hand : null} onPositionChange={twoFive.setRange} getNodeView={getNodeView} onNodeClick={onNodeClick} />;

  if (!valid) return <Navigate to="/practice/all" replace />;
  const Layout = isMobile ? MobileLayout : DesktopLayout;
  return (
    <>
      <Layout navigation={<AppBar navMode={navMode} mobile={isMobile} onHelp={() => setHelpOpen(true)} onSettings={() => setSettingsOpen(true)} />} header={header} controls={controls} board={fretboard} />
      <Overlay open={settingsOpen} onClose={() => setSettingsOpen(false)} title="설정">{settings}</Overlay>
      <HelpDialog open={helpOpen} navMode={navMode} firstVisit={!seenGuide} onClose={() => { setHelpOpen(false); setSeenGuide(true); }} />
      {mode !== 'direct' && <RotateDevice />}
    </>
  );
}
