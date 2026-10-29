import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MODES, LEGACY_MODE, NOTE_MODES, navModeFor } from '../constants/modes.js';
import { createFretboard, BASIC_MAX_FRET } from '../utils/fretboard.js';
import { getPitchClass, noteLabel, spellingPreference } from '../utils/notes.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useStoredState } from '../hooks/useStoredState.js';
import { useMicPitch } from '../hooks/useMicPitch.js';
import { useTheme } from '../hooks/useTheme.js';
import { fretSemitone, playFret, setInstrument } from '../utils/guitarSound.js';
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
import { Field, Section, Segmented } from '../components/controls/ControlPrimitives.jsx';
import ChordToneControls from '../components/controls/ChordToneControls.jsx';
import DirectPracticeControls from '../components/controls/DirectPracticeControls.jsx';
import TwoFiveOneControls from '../components/controls/TwoFiveOneControls.jsx';
import MicControls from '../components/controls/MicControls.jsx';
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
  const [instrument, setInstrumentName] = useStoredState('fretmaster.instrument', 'electric_guitar_clean');
  // 브라우저는 사용자가 한 번 누른 뒤에야 소리를 낼 수 있어서, 첫 입력 때 악기를 받아 온다.
  useEffect(() => {
    const load = () => setInstrument(instrument);
    window.addEventListener('pointerdown', load, { once: true });
    if (document.userActivation?.hasBeenActive) load();
    return () => window.removeEventListener('pointerdown', load);
  }, [instrument]);
  const [theme, setTheme] = useTheme();
  // 지판 보기 범위. 저장된 값이 없으면 휴대폰은 자동, PC는 전체
  const [storedView, setView] = useStoredState('fretmaster.view', null);
  const view = storedView ?? (isMobile ? 'AUTO' : 'FULL');
  const [skin, setSkin] = useStoredState('fretmaster.skin', { wood: 'rosewood', inlay: 'dot', material: 'pearl' });
  const [flashKey, setFlashKey] = useState(null);
  const flashTimer = useRef(null);
  const [noteTypes, setNoteTypes] = useState({ natural: true, sharp: false, flat: false });
  const preference = noteTypes.flat && !noteTypes.sharp ? 'FLAT' : noteTypes.sharp && !noteTypes.flat ? 'SHARP' : 'BOTH';
  const base = useNotePractice(LEGACY_MODE[mode] ?? 'ALL', board, noteTypes);
  const third = useThirdPractice(board, noteTypes, preference);
  const penta = usePentatonicPractice(preference);
  const chord = useChordTonePractice(noteTypes, preference);
  const direct = useDirectPractice();
  const twoFiveSweep = useTwoFiveOnePractice();
  const twoFiveSevenOne = useTwoFiveOnePractice('SEVEN_ONE');
  const isTwoFive = mode === 'two-five-one' || mode === 'two-five-one-71';
  const twoFive = mode === 'two-five-one-71' ? twoFiveSevenOne : twoFiveSweep;

  const state = mode === 'third' ? third : mode === 'pentatonic' ? penta : mode === 'chord-tone' ? chord : isTwoFive ? twoFive : mode === 'direct' ? direct : base;
  const modeMeta = MODES.find((item) => item.id === mode);
  const navMode = navModeFor(mode);
  const isNoteMode = NOTE_MODES.includes(mode);

  const press = useCallback((node) => {
    state.click(node);
    setFlashKey(node.key);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashKey(null), 700);
  }, [state]);
  const onNodeClick = useCallback((node) => {
    // 맞든 틀리든 누른 칸의 소리를 들려준다.
    if (soundOn) playFret(node.string, node.fret);
    press(node);
  }, [press, soundOn]);

  // 마이크: 실제 기타로 친 음을 듣고 지금 차례의 칸을 누른 것처럼 처리한다.
  // 어느 줄에서 쳤는지는 소리로 알 수 없어서, 차례가 정해진 모드(직접 연습·ii-V-I 훑기·1줄 코드톤)에서만 쓴다.
  // 화음 배음 때문에 옥타브를 헷갈릴 수 있어 같은 음이름이면 한 옥타브 차이까지 받아준다.
  const [micDevice, setMicDevice] = useStoredState('fretmaster.micDevice', '');
  const micMode = mode === 'direct' || mode === 'chord-tone' || (isTwoFive && twoFive.sweep);
  const samePitchClass = (a, b) => (((a - b) % 12) + 12) % 12 === 0;
  const onHeard = (semitone) => {
    if (mode === 'direct') {
      if (samePitchClass(semitone + 4, getPitchClass(direct.target))) direct.next();
      return;
    }
    if (isTwoFive && twoFive.sweep) {
      const expected = twoFive.tones[twoFive.step];
      if (!expected || twoFive.complete) return;
      const target = fretSemitone(expected.string, expected.fret);
      if (samePitchClass(semitone, target) && Math.abs(semitone - target) <= 12) press(board.find((node) => node.key === expected.key));
      return;
    }
    if (mode === 'chord-tone') {
      const candidates = board.filter((node) => node.string === chord.string && !chord.found.has(node.key) && samePitchClass(fretSemitone(node.string, node.fret), semitone));
      const node = candidates.sort((a, b) => Math.abs(fretSemitone(a.string, a.fret) - semitone) - Math.abs(fretSemitone(b.string, b.fret) - semitone))[0];
      if (node) press(node);
    }
  };
  const mic = useMicPitch(onHeard, micDevice);
  useEffect(() => { if (!micMode) mic.stop(); }, [micMode]); // eslint-disable-line react-hooks/exhaustive-deps
  const getModeNodeView = useCallback((node) => {
    const wrong = state.wrongKey === node.key;
    if (mode === 'third') {
      const root = third.rootFret === node.fret && third.task.string === node.string;
      const correct = root || third.found.has(node.key);
      return { disabled: !third.activeStrings.includes(node.string), wrong, correct, tone: root ? 'tone-root' : 'tone-third', label: wrong ? noteLabel(node.note, spellingPreference(third.task.note, preference)) : root ? '1' : third.found.has(node.key) ? (third.quality === 'MAJOR' ? '3' : 'b3') : '' };
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
      const tone = degree === '1' ? 'tone-root' : degree?.includes('3') ? 'tone-third' : degree.includes('5') ? 'tone-fifth' : 'tone-seventh';
      return { disabled: node.string !== chord.string, wrong, correct, tone, label: wrong ? noteLabel(node.note, spellingPreference(chord.root, preference)) : degree };
    }
    if (isTwoFive) {
      const hit = twoFive.found.find((item) => item.key === node.key);
      const degree = hit?.degree ?? '';
      const tone = degree === '1' ? 'tone-root' : degree.includes('3') ? 'tone-third' : degree.includes('5') ? 'tone-fifth' : 'tone-seventh';
      return { disabled: !twoFive.activeStrings.includes(node.string) || twoFive.complete, wrong, correct: Boolean(hit), tone, label: wrong ? noteLabel(node.note, spellingPreference(twoFive.key, preference)) : degree };
    }
    return { disabled: node.fret > BASIC_MAX_FRET || !base.activeStrings.includes(node.string), wrong, correct: base.found.has(node.key), tone: 'tone-note', label: wrong ? noteLabel(node.note, spellingPreference(base.target, preference)) : base.found.has(node.key) ? noteLabel(base.target, preference) : '' };
  }, [base, chord, isTwoFive, mode, penta, preference, state.wrongKey, third, twoFive]);
  // 표시 유지를 끄면 실제 기타처럼 방금 누른 정답만 잠깐 보여주고 루트를 포함해 이전에 찾은 위치는 모두 숨긴다.
  const getNodeView = useCallback((node) => {
    const view = getModeNodeView(node);
    const revealed = keepMarks || node.key === flashKey || (mode === 'pentatonic' && penta.preview);
    return view.correct && !revealed ? { ...view, correct: false, label: '' } : view;
  }, [flashKey, getModeNodeView, keepMarks, mode, penta.preview]);

  // 자동: 음 찾기 모드는 출제 범위(0–12프렛), 펜타토닉은 지금 포지션 근처만. 나머지는 답을 미리 알려주지 않도록 전체.
  const range = useMemo(() => {
    const fixed = { LOW: [0, 12], MID: [5, 17], HIGH: [12, 24] }[view];
    if (fixed) return fixed;
    if (view !== 'AUTO') return [0, 24];
    if (isNoteMode) return [0, BASIC_MAX_FRET];
    if (mode === 'pentatonic') {
      const frets = penta.targets.map((item) => item.fret);
      const middle = Math.round((Math.min(...frets) + Math.max(...frets)) / 2);
      const from = Math.max(0, Math.min(24 - 8, middle - 4));
      return [from, from + 8];
    }
    return [0, 24];
  }, [isNoteMode, mode, penta.targets, view]);

  const target = useMemo(() => mode === 'all' || mode === 'one' || mode === 'multi' || mode === 'sequence' ? noteLabel(base.target, preference) : state.target, [base.target, mode, preference, state.target]);
  const settings = (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-col gap-4 p-5">
        <h3 className="text-lg font-bold text-ink">{navMode.label}</h3>
        {isNoteMode && <div className="control-stack"><Section title="연습 범위">
          <Field label="범위"><Segmented ariaLabel="음 찾기 범위" value={mode} onChange={(id) => navigate(`/practice/${id}`)} options={NOTE_MODES.map((id) => ({ value: id, label: MODES.find((item) => item.id === id).label }))} /></Field>
          <StringSelector mode={mode} oneString={base.oneString} setOneString={base.setOneString} multiStrings={base.multiStrings} setMultiStrings={base.setMultiStrings} />
        </Section></div>}
        {mode === 'direct' && <DirectPracticeControls state={direct} />}
        {mode === 'third' && <ThirdControls state={third} preference={preference} />}
        {mode === 'pentatonic' && <PentatonicControls state={penta} preference={preference} />}
        {mode === 'chord-tone' && <ChordToneControls state={chord} preference={preference} />}
        {isTwoFive && <TwoFiveOneControls state={twoFive} />}
      </section>
      {micMode && <section className="card flex flex-col gap-4 p-5"><MicControls mic={mic} device={micDevice} setDevice={setMicDevice} /></section>}
      {mode !== 'direct' && <section className="card flex flex-col gap-4 p-5">
        <h3 className="text-lg font-bold text-ink">공통 설정</h3>
        <GlobalControls noteTypes={noteTypes} setNoteTypes={setNoteTypes} showFrets={showFrets} setShowFrets={setShowFrets} keepMarks={keepMarks} setKeepMarks={setKeepMarks} soundOn={soundOn} setSoundOn={setSoundOn} instrument={instrument} setInstrument={setInstrumentName} skin={skin} setSkin={setSkin} theme={theme} setTheme={setTheme} view={view} setView={setView} />
      </section>}
    </div>
  );
  const controls = mode === 'pentatonic' ? <section className="control-panel card"><PentatonicActions state={penta} /></section> : null;
  const headerStatus = mode === 'chord-tone' ? <ChordDegreeProgress degrees={chord.tones.map((tone) => tone.degree)} step={chord.step} /> : isTwoFive ? <TwoFiveOneProgress progression={twoFive.activeChords} chordIndex={twoFive.chordIndex} degrees={twoFive.tones.map((tone) => tone.degree)} step={twoFive.step} total={twoFive.sweep ? twoFive.tones.length : 0} /> : state.status;
  const header = <QuizHeader eyebrow={isNoteMode ? `${navMode.label} · ${modeMeta.label}` : modeMeta.label} target={target} description={state.description} status={headerStatus} />;
  const fretboard = mode === 'direct' ? <DirectPracticePanel state={direct} mic={mic} /> : <Fretboard board={board} showFrets={showFrets} skin={skin} range={range} activeStrings={state.activeStrings} getNodeView={getNodeView} onNodeClick={onNodeClick} />;

  if (!valid) return <Navigate to="/practice/all" replace />;
  const Layout = isMobile ? MobileLayout : DesktopLayout;
  return (
    <>
      <Layout navigation={<AppBar navMode={navMode} mobile={isMobile} mic={micMode ? mic : null} onHelp={() => setHelpOpen(true)} onSettings={() => setSettingsOpen(true)} />} header={header} controls={controls} board={fretboard} />
      <Overlay open={settingsOpen} onClose={() => setSettingsOpen(false)} title="설정">{settings}</Overlay>
      <HelpDialog open={helpOpen} navMode={navMode} firstVisit={!seenGuide} onClose={() => { setHelpOpen(false); setSeenGuide(true); }} />
      {mode !== 'direct' && <RotateDevice />}
    </>
  );
}
