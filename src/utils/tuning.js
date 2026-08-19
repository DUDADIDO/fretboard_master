// 1번줄부터 6번줄: E B G D A E
export const OPEN_STRING_NOTES = ['E', 'B', 'G', 'D', 'A', 'E'];
export const STRING_NUMBERS = [6, 5, 4, 3, 2, 1];

export function crossesGBoundary(stringA, stringB) {
  return (stringA === 3 && stringB === 2) || (stringA === 2 && stringB === 3);
}

export function getAdjacentStringInterval(fromString, toString) {
  if (Math.abs(fromString - toString) !== 1) throw new Error('인접한 줄만 계산할 수 있습니다.');
  return crossesGBoundary(fromString, toString) ? 4 : 5;
}
