import { useMemo } from 'react';
import Fret from './Fret.jsx';
import { getFretRatios, MAX_FRET } from '../../utils/fretboard.js';

export default function Fretboard({ board, showFrets, activeStrings, getNodeView, onNodeClick }) {
  const ratios = useMemo(() => getFretRatios(), []);
  const columns = ratios.map((ratio) => `${ratio}fr`).join(' ');
  return (
    <section className="fretboard-shell" aria-label="24프렛 기타 지판">
      <div className="fretboard" style={{ gridTemplateColumns: columns }}>
        <div className="string-layer" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((string) => <span key={string} className={`guitar-string string-${string} ${activeStrings.includes(string) ? '' : 'dimmed'}`} style={{ top: `${(string - 0.5) * (100 / 6)}%` }} />)}
        </div>
        {Array.from({ length: MAX_FRET + 1 }, (_, fret) => <Fret key={fret} fret={fret} nodes={board.filter((node) => node.fret === fret)} showFrets={showFrets} getNodeView={getNodeView} onNodeClick={onNodeClick} />)}
      </div>
    </section>
  );
}
