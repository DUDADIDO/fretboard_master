# 지판의 모든 음(E2=0 ~ 6번줄 기준 48반음)을 깨끗한 DI 기타 소리로 만든다.
# Karplus-Strong + 피킹 위치 콤 필터 + 픽업 톤. 48kHz mono float WAV, 한 음 1.8초
import array, math, random, struct, sys
SR = 48000
E2 = 440 * 2 ** (-29 / 12)
out = sys.argv[1]
random.seed(7)
def pluck(freq, seconds=1.8):
    n = int(SR * seconds); period = SR / freq; p = max(2, int(period))
    frac = period - p
    noise = [random.uniform(-1, 1) for _ in range(p)]
    # 피킹 위치(브리지에서 1/7 지점) 콤 필터로 배음 모양을 실제 줄처럼
    d = max(1, int(p / 7))
    line = [noise[i] - noise[(i - d) % p] for i in range(p)]
    ring = 3.2 if freq < 200 else 2.4 if freq < 500 else 1.6
    decay = 10 ** (-3 / (freq * ring))
    data = []; pos = 0; prev = 0.0
    for i in range(n):
        cur = line[pos]; nxt = line[(pos + 1) % p]
        # 분수 지연은 1차 올패스 근사 대신 선형 보간으로 음정 보정
        y = decay * ((1 - 0.5) * cur + 0.5 * nxt)
        line[pos] = y
        data.append(cur)
        pos = (pos + 1) % p
    # 음정 보정: 실제 주기 p+0.5 대비 목표 period로 리샘플
    ratio = (p + 0.5) / period
    res = []
    for i in range(n):
        x = i * ratio
        j = int(x)
        if j + 1 >= len(data): break
        t = x - j
        res.append(data[j] * (1 - t) + data[j + 1] * t)
    # 픽업 톤: 완만한 로우패스(약 5kHz) + 직류 제거
    a = math.exp(-2 * math.pi * 5000 / SR); lp = 0.0; hp_prev_in = 0.0; hp_prev_out = 0.0; r = 0.995
    outbuf = []
    for x in res:
        lp = (1 - a) * x + a * lp
        y = lp - hp_prev_in + r * hp_prev_out
        hp_prev_in, hp_prev_out = lp, y
        outbuf.append(y)
    peak = max(abs(v) for v in outbuf) or 1
    # DI 레벨: 피크 -6dBFS 정도(앰프 캡처 입력 기준으로 무난한 세기)
    return [v / peak * 0.5 for v in outbuf]

def write_wav(path, samples):
    data = array.array('f', samples).tobytes()
    with open(path, 'wb') as f:
        f.write(b'RIFF' + struct.pack('<I', 36 + len(data)) + b'WAVE')
        f.write(b'fmt ' + struct.pack('<IHHIIHH', 16, 3, 1, SR, SR * 4, 4, 32))
        f.write(b'data' + struct.pack('<I', len(data)) + data)

for semi in range(0, 49):
    write_wav(f'{out}/di-{semi:02d}.wav', pluck(E2 * 2 ** (semi / 12)))
print('done', 49)
