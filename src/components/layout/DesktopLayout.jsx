export default function DesktopLayout({ navigation, header, controls, board }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1800px] flex-col gap-3 px-4 py-4 xl:px-7">
      {navigation}
      <section className="flex flex-col gap-3">
        {header}
        <div className="practice-board-area">{board}</div>
        {controls}
      </section>
    </main>
  );
}
