import { ALL_NOTE_SPELLINGS } from '../../utils/notes.js';

export function shuffledNotes(previous, pool = ALL_NOTE_SPELLINGS) {
  const notes = [...pool];
  for (let i = notes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [notes[i], notes[j]] = [notes[j], notes[i]];
  }
  if (notes.length > 1 && notes[0] === previous) {
    const j = 1 + Math.floor(Math.random() * (notes.length - 1));
    [notes[0], notes[j]] = [notes[j], notes[0]];
  }
  return notes;
}

export function randomNote(previous, notes = ALL_NOTE_SPELLINGS) {
  const pool = notes.filter((note) => note !== previous);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : notes[0];
}

export function createSession(practice = 'RANDOM', previous, round = 1, pool = ALL_NOTE_SPELLINGS) {
  const queue = practice === 'ALL_ONCE' ? shuffledNotes(previous, pool) : [randomNote(previous, pool)];
  return { practice, pool, queue, index: 0, round };
}

export function advanceSession(session) {
  const previous = session.queue[session.index];
  if (session.practice === 'RANDOM') return createSession('RANDOM', previous, 1, session.pool);
  if (session.index === session.queue.length - 1) return createSession('ALL_ONCE', previous, session.round + 1, session.pool);
  return { ...session, index: session.index + 1 };
}
