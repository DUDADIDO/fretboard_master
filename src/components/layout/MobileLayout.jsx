export default function MobileLayout({ navigation, header, controls, board }) {
  return (
    <main className="flex min-h-dvh flex-col gap-1.5 px-2 py-1.5">
      {navigation}
      {header}
      <div className="practice-board-area">{board}</div>
      {controls}
    </main>
  );
}
