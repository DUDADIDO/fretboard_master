import { DefaultScheduler, Rating } from 'ts-fsrs';

// 약점 복습: 문제(예: "F#을 3번줄에서")마다 FSRS 카드 하나를 두고,
// 틀리거나 오래 걸린 문제는 몇 분 안에 다시, 잘 아는 문제는 점점 드물게 낸다.
const STORAGE_KEY = 'fretmaster.srs';
// 한 번 연습하는 동안 다시 볼 수 있게 학습 단계를 짧게(분 단위) 잡는다.
const schedulerPromise = DefaultScheduler({ enableFuzz: false, learningSteps: ['1m', '5m'], relearningSteps: ['2m'] });

function load() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    // JSON에는 날짜가 문자열로 남아서 Date로 되살린다.
    return Object.fromEntries(Object.entries(saved).map(([id, card]) => [id, { ...card, dueAt: new Date(card.dueAt), lastReviewAt: card.lastReviewAt ? new Date(card.lastReviewAt) : null }]));
  } catch { return {}; }
}

let cards = null;
const getCards = () => (cards ??= load());
const save = () => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getCards())); } catch { /* 저장 실패는 무시 */ } };

// 맞힌 시간과 실수로 점수를 매긴다. 실수 → 다시, 느림 → 어려움, 빠름 → 쉬움
export function gradeFor({ mistakes, secondsPerAnswer }) {
  if (mistakes > 0) return Rating.Again;
  if (secondsPerAnswer > 4) return Rating.Hard;
  if (secondsPerAnswer < 1.5) return Rating.Easy;
  return Rating.Good;
}

export async function review(id, grade, now = new Date()) {
  const scheduler = await schedulerPromise;
  const all = getCards();
  const card = all[id] ?? scheduler.newCard({ now });
  all[id] = scheduler.review({ card, grade, now }).card;
  save();
}

// 다음 문제 고르기: 때가 된 복습 → 아직 안 본 문제 → 가장 빨리 돌아올 문제 순. 같은 순위에서는 앞쪽 몇 개 중 무작위.
export function pickNext(ids, previous, now = new Date()) {
  const all = getCards();
  const candidates = ids.length > 1 ? ids.filter((id) => id !== previous) : ids;
  const due = candidates.filter((id) => all[id] && all[id].dueAt <= now).sort((a, b) => all[a].dueAt - all[b].dueAt);
  const fresh = candidates.filter((id) => !all[id]);
  const later = candidates.filter((id) => all[id] && all[id].dueAt > now).sort((a, b) => all[a].dueAt - all[b].dueAt);
  const pool = due.length ? due.slice(0, 3) : fresh.length ? fresh : later.slice(0, 3);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function dueCount(ids, now = new Date()) {
  const all = getCards();
  return ids.filter((id) => all[id] && all[id].dueAt <= now).length;
}

export function resetReview() {
  cards = {};
  save();
}
