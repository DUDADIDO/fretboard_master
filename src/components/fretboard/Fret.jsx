import NoteNode from './NoteNode.jsx';
import { INLAY_FRETS } from '../../utils/fretboard.js';

export default function Fret({ fret, nodes, showFrets, getNodeView, onNodeClick }) {
  const inlay = INLAY_FRETS.includes(fret);
  return (
    <div className={`fret-slot ${fret === 0 ? 'nut-slot' : ''}`}>
      {showFrets && <span className="fret-number">{fret === 0 ? 'NUT' : fret}</span>}
      {inlay && <span className={`inlay ${fret === 12 || fret === 24 ? 'double' : ''}`} />}
      {nodes.map((node) => <NoteNode key={node.key} node={node} view={getNodeView(node)} onClick={onNodeClick} />)}
    </div>
  );
}
