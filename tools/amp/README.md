# NAM 앰프 톤 만들기

지판 클릭 소리 중 "앰프" 톤(public/sounds/amp-*.mp3)을 만드는 스크립트.
모든 음(E2부터 49음)의 깨끗한 DI 소리를 NAM 앰프 캡처에 미리 통과시켜, 톤마다 한 파일(음마다 1.5초 칸)로 묶는다.

| 톤 | 체인 |
| --- | --- |
| clean | Two-Rock SSS (AATR SX3 Clean BAL3 CAB) |
| overdrive | Boss SD-1 (Drive-III) → Two-Rock |
| crunch | EVH 5150III Ivory (Blue-VI) + 간단한 캐비닛 필터(앰프만 캡처라서) |
| highgain | Mesa 90s Dual Rectifier (Red Modern Classic, 풀 리그) |

## 순서

`$WORK`는 작업 폴더. `.nam` 캡처(TONE3000)는 저장소에 넣지 않는다(`$WORK/nam/<팩 이름>/`에 압축을 푼다).

1. NAM 공식 엔진(https://github.com/sdatkinson/NeuralAmpModelerCore)의 render 도구를 빌드해 `$WORK/bin/nam-render`에 둔다.
   ```
   g++ -std=c++20 -O3 -DNDEBUG -DNAM_ENABLE_A2_FAST -IDependencies/AudioDSPTools/dsp -I. -IDependencies/eigen -IDependencies/nlohmann \
     tools/render.cpp NAM/*.cpp NAM/wavenet/*.cpp Dependencies/AudioDSPTools/dsp/wav.cpp -o $WORK/bin/nam-render
   ```
2. `mkdir -p $WORK/di && python3 make_di.py $WORK/di` — DI 음 49개
3. `python3 render_tones.py $WORK` — 톤별 스프라이트 WAV(`$WORK/tones/*.wav`)
4. `node encode.mjs $WORK/tones/crunch.wav ../../public/sounds/amp-crunch.mp3 112` — 톤마다 MP3로(`@breezystack/lamejs` 필요)

캡처나 세부 채널(예: 5150 Blue-VI)을 바꾸려면 `render_tones.py`의 `TONES`만 고치면 된다.
