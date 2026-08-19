export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NAMES = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
export const NATURAL_NOTES = NOTES.filter((note) => !note.includes('#'));
export const SHARP_NOTES = NOTES.filter((note) => note.includes('#'));
export const FLATS = Object.values(FLAT_NAMES);

const FLAT_TO_SHARP = Object.fromEntries(Object.entries(FLAT_NAMES).map(([sharp, flat]) => [flat, sharp]));

export function canonicalNote(note) {
  return FLAT_TO_SHARP[note] ?? note;
}

export function getPitchClass(note) {
  return NOTES.indexOf(canonicalNote(note));
}

export function transpose(note, semitones) {
  return NOTES[(getPitchClass(note) + semitones + 120) % 12];
}

export function isSamePitchClass(a, b) {
  return getPitchClass(a) === getPitchClass(b);
}

export function noteLabel(note, preference = 'BOTH') {
  const sharp = canonicalNote(note);
  if (preference === 'FLAT' && FLAT_NAMES[sharp]) return FLAT_NAMES[sharp];
  if (preference === 'BOTH' && FLAT_NAMES[sharp]) return `${sharp}/${FLAT_NAMES[sharp]}`;
  return sharp;
}

export function getNotePool(types) {
  const pool = [];
  if (types.natural) pool.push(...NATURAL_NOTES);
  if (types.sharp) pool.push(...SHARP_NOTES);
  if (types.flat) pool.push(...FLATS);
  return pool.length ? pool : NATURAL_NOTES;
}
