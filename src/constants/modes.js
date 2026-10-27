export const MODES = [
  { id: 'all', label: '전체 줄', short: '전체' },
  { id: 'one', label: '한 줄', short: '1줄' },
  { id: 'multi', label: '여러 줄', short: '다중' },
  { id: 'sequence', label: '6→1→6 순차', short: '순차' },
  { id: 'direct', label: '기타 직접 연습', short: '직접' },
  { id: 'third', label: '3도 찾기', short: '3도' },
  { id: 'pentatonic', label: '펜타토닉', short: '펜타' },
  { id: 'chord-tone', label: '1줄 코드톤', short: '코드톤' },
  { id: 'two-five-one', label: 'ii-V-I 코드톤', short: '251' },
];

export const NOTE_MODES = ['all', 'one', 'multi', 'sequence'];

// 화면 상단 모드 선택에 보이는 항목. 음 찾기 4종은 하나로 묶고 범위는 설정에서 고른다.
export const NAV_MODES = [
  {
    id: 'notes', label: '지판 음 찾기', match: NOTE_MODES,
    summary: '화면에 나온 음을 지판에서 모두 찾아 누르는 기본 연습',
    help: ['가운데에 나온 음(예: C)을 지판에서 전부 찾아 누르세요. 0–12프렛 범위입니다.', '다 찾으면 자동으로 다음 음이 나옵니다.', '설정에서 범위를 전체 줄 / 한 줄 / 여러 줄 / 6→1→6 순차로 바꿀 수 있어요.'],
  },
  {
    id: 'direct', label: '기타 직접 연습', match: ['direct'],
    summary: '화면 대신 실제 기타로 음을 찾아 치는 연습',
    help: ['화면에 나온 음을 실제 기타에서 찾아 연주하세요.', '다 쳤으면 [다음 음] 버튼을 누릅니다.', '설정에서 ♯/♭ 포함 여부와 출제 방식(랜덤 / 전체 1회씩)을 고를 수 있어요.'],
  },
  {
    id: 'third', label: '3도 찾기', match: ['third'],
    summary: '루트에서 메이저/마이너 3도 위치를 익히는 연습',
    help: ['1단계: 지정된 줄에서 루트 음을 누르세요.', '2단계: 같은 줄과 양옆 줄에서 3도 위치를 모두 찾으세요.', '설정에서 메이저/마이너 3도와 출제 범위를 고를 수 있어요.'],
  },
  {
    id: 'pentatonic', label: '펜타토닉', match: ['pentatonic'],
    summary: '펜타토닉 5개 포지션 모양을 익히는 연습',
    help: ['현재 포지션의 펜타토닉 음을 줄별로 찾아 누르세요.', '막히면 아래 [정답 보기]나 [힌트]를 눌러보세요.', '설정에서 중심음, 메이저/마이너, 포지션(P1–P5), 출제 방식을 고를 수 있어요.'],
  },
  {
    id: 'chord-tone', label: '코드톤', match: ['chord-tone'],
    summary: '한 줄 위에서 코드의 1·3·5·7을 순서대로 찾는 연습',
    help: ['정해진 줄에서 코드의 1 → 3 → 5 → 7을 순서대로 누르세요.', '오른쪽 위 칩이 지금 찾을 도수를 알려줍니다.', '설정에서 코드 종류(Maj7 / m7 / 7), 루트, 줄, 진행 방식을 고를 수 있어요.'],
  },
  {
    id: 'two-five-one', label: 'ii-V-I 코드톤', match: ['two-five-one'],
    summary: '12키 ii-V-I 진행의 코드톤을 몸에 익히는 연습',
    help: ['기본은 포지션 훑기예요. 밝게 표시된 프렛 범위 안에서 지금 코드의 코드톤을 6번줄→1번줄(또는 반대, 왕복) 음높이 순서대로 빠짐없이 누르세요.', '포지션(한 손에 잡히는 범위)은 시작·끝 프렛으로 자유롭게 정하고, [포지션 이동]을 켜면 키마다 또는 한 바퀴마다 높은 프렛 쪽으로 자동으로 옮겨 가요.', 'Dm7 → G7 → CΔ7을 같은 포지션에서 이어 치면서 코드가 바뀔 때 코드톤이 어떻게 옮겨가는지 익혀요. 이게 체화되면 훑으면서 즉흥 솔로가 됩니다.', '연습 방식을 [한 줄 1·3·5·7]로 바꾸면 한 줄 위에서 1 → 3 → 5 → 7 순서로 찾는 연습이 돼요.', '한 키가 끝나면 차트 순서(C → F → B♭ …)로 다음 키로 넘어갑니다.', '설정의 출제 코드에서 m7 / 7 / Δ7 중 원하는 코드만, 출제 키에서 원하는 키만 골라 연습할 수 있어요.', '가이드톤(3·7)만 연습하거나 줄을 바꾸고, 키별 코드톤 표도 볼 수 있어요.'],
  },
];

export function navModeFor(mode) {
  return NAV_MODES.find((item) => item.match.includes(mode)) ?? NAV_MODES[0];
}

export const LEGACY_MODE = { all: 'ALL', one: 'ONE', multi: 'MULTI', sequence: 'SEQ' };
