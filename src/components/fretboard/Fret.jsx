import NoteNode from './NoteNode.jsx';
import { INLAY_FRETS } from '../../utils/fretboard.js';
import { Inlay } from './FretboardSkin.jsx';

export default function Fret({ fret, nodes, showFrets, inlay: inlayShape = 'dot', material = 'pearl', sideDots = true, compact = false, inPosition = false, getNodeView, onNodeClick }) {
  const inlay = INLAY_FRETS.includes(fret);
  return (
    <div className={`fret-slot ${fret === 0 ? 'nut-slot' : ''} ${inPosition ? 'in-position' : ''}`}>
      {/* 사이드 도트: 넥 옆면 표시. 프렛 번호 위에, 번호를 끄면 그 자리로 내려온다. */}
      {sideDots && inlay && <span className="side-dots" aria-hidden="true">{(fret === 12 || fret === 24) && <span className="side-dot" />}<span className="side-dot" /></span>}
      {showFrets && (!compact || inlay) && <span className="fret-number">{fret === 0 ? 'NUT' : fret}</span>}
      {inlay && <Inlay shape={inlayShape} material={material} fret={fret} index={INLAY_FRETS.indexOf(fret)} />}
      {nodes.map((node) => <NoteNode key={node.key} node={node} view={getNodeView(node)} onClick={onNodeClick} />)}
    </div>
  );
}
