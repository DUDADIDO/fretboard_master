export default function MobileLayout({ navigation, header, controls, board }) {
  return (
    <main className="flex h-dvh min-h-0 flex-col gap-1.5 overflow-hidden px-2 py-1.5">
      {header}
      <div className="min-h-0 flex-1">{board}</div>
      <div className="max-h-[42dvh] shrink-0 overflow-y-auto">{controls}</div>
      {navigation}
    </main>
  );
}
