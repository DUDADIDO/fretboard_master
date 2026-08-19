export default function DesktopLayout({ navigation, header, controls, board }) {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-[1800px] flex-col gap-3 overflow-hidden px-4 py-4 xl:px-7">
      {navigation}
      <section className="grid min-h-0 flex-1 grid-rows-[auto_auto_minmax(210px,1fr)] gap-3">
        {header}
        {controls}
        {board}
      </section>
    </main>
  );
}
