const TONES = {
  root: 'border-blue-400/35 bg-blue-500/15 text-blue-300',
  third: 'border-amber-400/35 bg-amber-500/15 text-amber-300',
  fifth: 'border-green-400/35 bg-green-500/15 text-green-300',
  seventh: 'border-purple-400/35 bg-purple-500/15 text-purple-300',
};

export default function ChordDegreeProgress({ degrees, step }) {
  return (
    <div className="flex items-center justify-end gap-1" aria-label={`코드톤 진행 ${Math.min(step, 4)}/4`}>
      {degrees.map((degree, index) => {
        const tone = index === 0 ? 'root' : index === 1 ? 'third' : index === 2 ? 'fifth' : 'seventh';
        const done = index < step;
        const current = index === step;
        return <span key={degree} className={`grid h-8 min-w-8 place-items-center rounded-lg border px-2 text-xs font-black transition-colors ${TONES[tone]} ${!done && !current ? 'opacity-35 saturate-50' : ''} ${current ? 'ring-1 ring-white/45' : ''}`}>{degree}{done ? ' ✓' : current ? ' ●' : ''}</span>;
      })}
    </div>
  );
}
