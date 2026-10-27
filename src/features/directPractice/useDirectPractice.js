import { useState } from 'react';
import { getNotePool } from '../../utils/notes.js';
import { createSession, advanceSession } from './session.js';

export function useDirectPractice() {
  const [session, setSession] = useState(() => ({ ...createSession(), noteTypes: { natural: true, sharp: true, flat: true } }));
  const isAllOnce = session.practice === 'ALL_ONCE';
  return {
    ...session,
    setPractice: (practice) => setSession((current) => practice === current.practice ? current : { ...createSession(practice, undefined, 1, current.pool), noteTypes: current.noteTypes }),
    toggleNoteType: (key) => setSession((current) => {
      if (current.noteTypes[key] && Object.values(current.noteTypes).filter(Boolean).length === 1) return current;
      const noteTypes = { ...current.noteTypes, [key]: !current.noteTypes[key] };
      return { ...createSession(current.practice, undefined, 1, getNotePool(noteTypes)), noteTypes };
    }),
    target: session.queue[session.index],
    next: () => setSession((current) => ({ ...advanceSession(current), noteTypes: current.noteTypes })),
    description: '표시된 음을 실제 기타에서 찾아 연주하세요',
    status: isAllOnce ? `${session.round}회차 · ${session.index + 1}/${session.pool.length}` : '랜덤 1음',
    isAllOnce,
    isLast: isAllOnce && session.index === session.queue.length - 1,
    noteCount: session.pool.length,
  };
}
