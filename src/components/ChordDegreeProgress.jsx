const TONES = {
  root: 'border-brand/30 bg-mint text-brand',
  third: 'degree-third',
  fifth: 'degree-fifth',
  seventh: 'degree-seventh',
};

export default function ChordDegreeProgress({ degrees, step }) {
  return (
    <div className="flex items-center justify-end gap-1" aria-label={`코드톤 진행 ${Math.min(step, degrees.length)}/${degrees.length}`}>
      {degrees.map((degree, index) => {
        const tone = degree === '1' ? 'root' : degree.includes('3') ? 'third' : degree === '5' ? 'fifth' : 'seventh';
        const done = index < step;
        const current = index === step;
        return <span key={degree} className={`grid h-8 min-w-8 place-items-center rounded-full border px-2.5 text-xs font-bold transition-colors ${TONES[tone]} ${!done && !current ? 'opacity-40 saturate-50' : ''} ${current ? 'ring-2 ring-accent' : ''}`}>{degree}{done ? ' ✓' : current ? ' ●' : ''}</span>;
      })}
    </div>
  );
}
