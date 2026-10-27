import { useEffect, useState } from 'react';

// 새로고침해도 유지되는 사용자 설정. 저장소를 못 쓰는 환경에서는 기본값으로 동작한다.
export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved == null ? initial : JSON.parse(saved);
    } catch { return initial; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 실패는 무시 */ }
  }, [key, value]);
  return [value, setValue];
}
