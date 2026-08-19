export default function RotateDevice() {
  return (
    <div className="rotate-warning fixed inset-0 z-50 hidden flex-col items-center justify-center bg-slate-950 p-8 text-center text-white">
      <span className="mb-4 text-5xl">↻</span>
      <h1 className="text-xl font-extrabold">화면을 가로로 돌려주세요</h1>
      <p className="mt-2 text-sm text-slate-400">넓은 기타 지판을 위해 모바일은 가로모드에 최적화되어 있습니다.</p>
    </div>
  );
}
