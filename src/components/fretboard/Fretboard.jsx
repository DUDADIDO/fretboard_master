import { useMemo } from 'react';
import Fret from './Fret.jsx';
import PositionRange from './PositionRange.jsx';
import { SkinDefs, WoodGrain, WOODS } from './FretboardSkin.jsx';
import { BodyEdge, Headstock } from './GuitarEnds.jsx';
import { getFretRatios, MAX_FRET } from '../../utils/fretboard.js';

// range: 보여줄 프렛 [처음, 끝]. 좁히면 그 구간만 크게 보인다. 0프렛이 빠지면 헤드스톡, 24프렛이 빠지면 바디를 숨긴다.
export default function Fretboard({ board, showFrets, activeStrings, skin = { wood: 'rosewood', inlay: 'dot', material: 'pearl' }, range = [0, MAX_FRET], position = null, onPositionChange, getNodeView, onNodeClick }) {
  const [from, to] = range;
  const allRatios = useMemo(() => getFretRatios(), []);
  // fr 합이 1보다 작으면 그리드가 남는 공간을 비워 두므로 합이 1이 되게 다시 나눈다.
  const slice = allRatios.slice(from, to + 1);
  const ratios = slice.map((ratio) => ratio / slice.reduce((sum, value) => sum + value, 0));
  const columns = ratios.map((ratio) => `${ratio}fr`).join(' ');
  const frets = Array.from({ length: to - from + 1 }, (_, index) => from + index);
  return (
    <section className={`fretboard-shell ${position ? 'has-position' : ''} ${showFrets ? 'with-numbers' : ''} ${skin.sideDots !== false ? 'with-side-dots' : ''}`} aria-label="24프렛 기타 지판">
      <SkinDefs />
      <div className="neck-row">
      {from === 0 && <Headstock finish={skin.finish ?? 'black'} />}
      <div className={`fretboard wood-${skin.wood} ${from > 0 ? 'cut-left' : ''} ${to < MAX_FRET ? 'cut-right' : ''}`} style={{ gridTemplateColumns: columns, '--binding': (WOODS[skin.wood] ?? WOODS.rosewood).binding }}>
        <WoodGrain wood={skin.wood} />
        <div className="string-layer" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((string) => <span key={string} className={`guitar-string string-${string} ${activeStrings.includes(string) ? '' : 'dimmed'}`} style={{ top: `${(string - 0.5) * (100 / 6)}%` }} />)}
        </div>
        {frets.map((fret) => <Fret key={fret} fret={fret} inPosition={position != null && fret >= position[0] && fret <= position[1]} nodes={board.filter((node) => node.fret === fret)} showFrets={showFrets} inlay={skin.inlay} material={skin.material} sideDots={skin.sideDots !== false} getNodeView={getNodeView} onNodeClick={onNodeClick} />)}
        {position && onPositionChange && <PositionRange ratios={ratios} start={position[0]} end={position[1]} onChange={onPositionChange} resizable={false} />}
      </div>
      {to === MAX_FRET && <BodyEdge finish={skin.finish ?? 'black'} />}
      </div>
    </section>
  );
}
