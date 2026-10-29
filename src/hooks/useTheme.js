import { useEffect } from 'react';
import { useStoredState } from './useStoredState.js';

// 화면 테마: SYSTEM(기기 설정 따름) / LIGHT / DARK. <html>에 dark 클래스를 붙였다 뗀다.
export const THEMES = { SYSTEM: '기기 설정', LIGHT: '라이트', DARK: '다크' };

export function useTheme() {
  const [theme, setTheme] = useStoredState('fretmaster.theme', 'SYSTEM');
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'DARK' || (theme === 'SYSTEM' && media.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101412' : '#f2f0eb');
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
  return [theme, setTheme];
}
