import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { connectFromHash, startAutoFlush } from './utils/practiceLog.js';

// 연습 일지에서 "Fretmaster와 연결"로 열었으면 연결 정보를 저장한다.
if (connectFromHash()) window.setTimeout(() => window.alert('연습 일지와 연결됐어요. 이제 이 브라우저에서 연습한 시간과 정답률이 일지에 들어가요.'), 300);
startAutoFlush();

createRoot(document.getElementById('root')).render(
  <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>,
);
