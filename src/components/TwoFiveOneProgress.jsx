import ChordDegreeProgress from './ChordDegreeProgress.jsx';

export default function TwoFiveOneProgress({ progression, chordIndex, degrees, step }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1 text-xs font-bold" aria-label={`ii-V-I 진행 ${chordIndex + 1}/${progression.length}`}>
        {progression.map((chord, index) => <span key={chord.roman} className={`rounded-full px-2 py-0.5 ${index === chordIndex ? 'bg-accent text-white' : index < chordIndex ? 'text-brand' : 'text-ink-soft/60'}`}>{chord.symbol}{index < chordIndex ? ' ✓' : ''}</span>)}
      </div>
      <ChordDegreeProgress degrees={degrees} step={step} />
    </div>
  );
}
