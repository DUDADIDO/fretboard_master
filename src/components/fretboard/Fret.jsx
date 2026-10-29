import NoteNode from './NoteNode.jsx';
import { INLAY_FRETS } from '../../utils/fretboard.js';
import { Inlay } from './FretboardSkin.jsx';

export default function Fret({ fret, nodes, showFrets, inlay: inlayShape = 'dot', material = 'pearl', inPosition = false, getNodeView, onNodeClick }) {
  const inlay = INLAY_FRETS.includes(fret);
  return (
    <div className={`fret-slot ${fret === 0 ? 'nut-slot' : ''} ${inPosition ? 'in-position' : ''}`}>
      {showFrets && <span className="fret-number">{fret === 0 ? 'NUT' : fret}</span>}
      {inlay && <Inlay shape={inlayShape} material={material} fret={fret} index={INLAY_FRETS.indexOf(fret)} />}
      {nodes.map((node) => <NoteNode key={node.key} node={node} view={getNodeView(node)} onClick={onNodeClick} />)}
    </div>
  );
}
