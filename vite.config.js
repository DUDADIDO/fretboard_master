import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // 홈 화면에 설치해 앱처럼 쓰고, 한 번 연 뒤에는 인터넷 없이도 열리게 한다.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fretmaster · 기타 지판 연습',
        short_name: 'Fretmaster',
        description: '기타 지판의 음, 인터벌, 펜타토닉, 코드톤을 단계적으로 훈련하는 앱',
        lang: 'ko',
        start_url: '/practice/all',
        scope: '/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#f2f0eb',
        theme_color: '#1e3932',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // 글꼴과 악기 샘플은 처음 받을 때 저장해 두고 오프라인에서도 쓴다.
        runtimeCaching: [
          { urlPattern: ({ url }) => /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.host), handler: 'StaleWhileRevalidate', options: { cacheName: 'fonts' } },
          { urlPattern: ({ url }) => url.pathname.startsWith('/sounds/'), handler: 'CacheFirst', options: { cacheName: 'amp-tones' } },
          { urlPattern: ({ url }) => /smpldsnds|gleitz\.github\.io|danigb\.github\.io/.test(url.host), handler: 'CacheFirst', options: { cacheName: 'instrument-samples', expiration: { maxEntries: 400 } } },
        ],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
  },
});
