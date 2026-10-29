// 연습 일지(Practice Log) 연동. 연습 일지 설정에서 "Fretmaster와 연결"로 연 브라우저에서만 동작한다.
// 연결 안 된 브라우저(다른 사용자)는 아무것도 모으거나 보내지 않는다.
const CONFIG_KEY = 'fretmaster.practiceLog';
const QUEUE_KEY = 'fretmaster.practiceLog.queue';
const IDLE_MS = 3 * 60 * 1000; // 3분 넘게 손을 안 대면 그 앞에서 한 번 끊는다
const GAP_MS = 90 * 1000; // 두 동작 사이가 이보다 길면 쉬는 시간으로 보고 연습 시간에 안 넣는다

const read = (key, fallback) => { try { return JSON.parse(window.localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* 저장 실패는 무시 */ } };

export const getConfig = () => read(CONFIG_KEY, null);
export const pendingCount = () => read(QUEUE_KEY, []).length;
export function disconnect() { window.localStorage.removeItem(CONFIG_KEY); window.localStorage.removeItem(QUEUE_KEY); current = null; }

// 연습 일지가 #practicelog=<base64 {url,key}> 로 열어 준다. 읽고 나면 주소창에서 지운다.
export function connectFromHash() {
  const match = window.location.hash.match(/practicelog=([^&]+)/);
  if (!match) return false;
  try {
    const { url, key } = JSON.parse(atob(decodeURIComponent(match[1])));
    if (!/^https?:\/\//.test(url) || !key) return false;
    write(CONFIG_KEY, { url: url.replace(/\/$/, ''), key });
    return true;
  } catch { return false; } finally {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

let current = null;

function close() {
  if (!current) return;
  const session = current;
  current = null;
  const activeSec = Math.round(session.activeMs / 1000);
  if (activeSec < 30) return;
  const { lastAt, activeMs, ...rest } = session; // eslint-disable-line no-unused-vars
  write(QUEUE_KEY, [...read(QUEUE_KEY, []), { ...rest, ended: lastAt, activeSec }].slice(-200));
}

function touch(mode, group, label) {
  if (!getConfig()) return null;
  const now = Date.now();
  if (current && (current.mode !== mode || now - current.lastAt > IDLE_MS)) close();
  if (!current) current = { id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`, mode, group, label, started: now, lastAt: now, activeMs: 0, presses: 0, wrong: 0 };
  const gap = now - current.lastAt;
  if (gap < GAP_MS) current.activeMs += gap;
  current.lastAt = now;
  return current;
}

export const practiceLog = {
  // 화면을 누르거나 기타로 치는 등 연습하고 있다는 신호
  activity(mode, group, label) { touch(mode, group, label); },
  press(mode, group, label) { const s = touch(mode, group, label); if (s) s.presses += 1; },
  miss(mode, group, label) { const s = touch(mode, group, label); if (s) s.wrong += 1; },
  // 모드를 바꾸거나 화면을 떠날 때
  end() { close(); flush(); },
};

let sending = false;
export async function flush() {
  const config = getConfig();
  const queue = read(QUEUE_KEY, []);
  if (!config || !queue.length || sending) return;
  sending = true;
  try {
    // text/plain 이라 사전 요청 없이 보내지고, 화면을 닫는 중에도 keepalive로 끝까지 간다.
    const response = await fetch(`${config.url}/api/fretmaster/sessions`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ key: config.key, sessions: queue }), keepalive: true });
    if (response.ok) {
      const sent = new Set(queue.map((item) => item.id));
      write(QUEUE_KEY, read(QUEUE_KEY, []).filter((item) => !sent.has(item.id)));
    } else if (response.status === 401) {
      // 연습 일지에서 연결을 끊었다
      disconnect();
    }
  } catch { /* 오프라인이면 다음에 다시 보낸다 */ } finally { sending = false; }
}

export function startAutoFlush() {
  if (!getConfig()) return;
  flush();
  window.addEventListener('online', flush);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') practiceLog.end(); });
  window.addEventListener('pagehide', () => practiceLog.end());
  window.setInterval(() => { if (current && Date.now() - current.lastAt > IDLE_MS) close(); flush(); }, 60 * 1000);
}
