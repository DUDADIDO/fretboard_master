import { useEffect } from 'react';

// 설정 패널(오른쪽 슬라이드)과 안내 창(가운데 모달)을 같은 방식으로 띄운다.
export default function Overlay({ open, onClose, title, variant = 'drawer', children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, open]);
  if (!open) return null;
  const drawer = variant === 'drawer';
  return (
    <div className={`fixed inset-0 z-40 flex bg-black/35 ${drawer ? 'justify-end' : 'items-center justify-center p-4'}`} onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}
        className={drawer ? 'flex h-full w-[min(420px,92vw)] flex-col bg-canvas shadow-[0_0_6px_rgba(0,0,0,.24),0_8px_12px_rgba(0,0,0,.14)]' : 'card flex max-h-[min(640px,92dvh)] w-full max-w-lg flex-col'}>
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <h2 className="text-xl font-semibold text-brand">{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="btn btn-dark min-h-9 px-3">닫기</button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <footer className="border-t border-black/[0.06] px-5 py-3">{footer}</footer>}
      </section>
    </div>
  );
}
