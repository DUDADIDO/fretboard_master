import { useMemo } from 'react';
import Fret from './Fret.jsx';
import PositionRange from './PositionRange.jsx';
import { SkinDefs, WoodGrain, WOODS } from './FretboardSkin.jsx';
import { BodyEdge, Headstock } from './GuitarEnds.jsx';
import { getFretRatios, MAX_FRET } from '../../utils/fretboard.js';

export default function Fretboard({ board, showFrets, activeStrings, skin = { wood: 'rosewood', inlay: 'dot', material: 'pearl' }, position = null, onPositionChange, getNodeView, onNodeClick }) {
  const ratios = useMemo(() => getFretRatios(), []);
  const columns = ratios.map((ratio) => `${ratio}fr`).join(' ');
  return (
    <section className={`fretboard-shell ${position ? 'has-position' : ''} ${showFrets ? 'with-numbers' : ''} ${skin.sideDots !== false ? 'with-side-dots' : ''}`} aria-label="24프렛 기타 지판">
      <SkinDefs />
      <div className="neck-row">
      <Headstock finish={skin.finish ?? 'black'} />
      <div className={`fretboard wood-${skin.wood}`} style={{ gridTemplateColumns: columns, '--binding': (WOODS[skin.wood] ?? WOODS.rosewood).binding }}>
        <WoodGrain wood={skin.wood} />
        <div className="string-layer" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((string) => <span key={string} className={`guitar-string string-${string} ${activeStrings.includes(string) ? '' : 'dimmed'}`} style={{ top: `${(string - 0.5) * (100 / 6)}%` }} />)}
        </div>
        {Array.from({ length: MAX_FRET + 1 }, (_, fret) => <Fret key={fret} fret={fret} inPosition={position != null && fret >= position[0] && fret <= position[1]} nodes={board.filter((node) => node.fret === fret)} showFrets={showFrets} inlay={skin.inlay} material={skin.material} sideDots={skin.sideDots !== false} getNodeView={getNodeView} onNodeClick={onNodeClick} />)}
        {position && onPositionChange && <PositionRange ratios={ratios} start={position[0]} end={position[1]} onChange={onPositionChange} resizable={false} />}
      </div>
      <BodyEdge finish={skin.finish ?? 'black'} />
      </div>
    </section>
  );
}
