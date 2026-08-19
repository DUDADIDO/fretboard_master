export default function NoteNode({ node, view, onClick }) {
  const label = view.label ?? '';
  return (
    <button
      type="button"
      className={`note-node ${view.disabled ? 'is-disabled' : ''} ${view.correct ? `is-correct ${view.tone ?? ''}` : ''} ${view.wrong ? 'is-wrong' : ''} ${view.hint ? 'is-hint' : ''}`}
      style={{ top: `${(node.string - 0.5) * (100 / 6)}%` }}
      onClick={() => onClick(node)}
      disabled={view.disabled && !view.correct}
      aria-label={`${node.string}번 줄 ${node.fret}프렛${label ? ` ${label}` : ''}`}
      title={`${node.string}번 줄 · ${node.fret}프렛${label ? ` · ${label}` : ''}`}
    >
      {label}
    </button>
  );
}
