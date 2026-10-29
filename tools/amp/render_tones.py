# DI 음들을 NAM 앰프 체인에 통과시켜 톤별 스프라이트(음마다 1.5초 칸) WAV를 만든다.
import math, os, struct, subprocess, sys
S = sys.argv[1]
NAM = f'{S}/nam'
BIN = f'{S}/bin/nam-render'
SR = 48000
SLOT = int(1.5 * SR)       # 한 음 칸
KEEP = int(1.35 * SR)      # 소리 길이
FADE = int(0.3 * SR)       # 끝 페이드아웃

TONES = {
    'clean': [f'{NAM}/Two-Rock_SSS_-_Ultimate_Clean/AATR SX3 Clean BAL3 CAB.nam'],
    'overdrive': [f'{NAM}/Boss_SD-1_Super_Overdrive/APP-SD1-Drive-III.nam', f'{NAM}/Two-Rock_SSS_-_Ultimate_Clean/AATR SX3 Clean BAL3 CAB.nam'],
    'crunch': [f'{NAM}/EVH_5150iii_Ivory_FULL_Pack-crunch/APP-5153-Ivory-Blue-VI.nam'],
    'highgain': [f'{NAM}/Mesa_90s_Dual_Rectifier_RI_-_Red_Modern_FULL_RIG-distortion/90sDualRec-FullRig-Red-Modn-Classic.nam'],
}
CAB = {'crunch'}  # 앰프만 캡처한 톤은 간단한 캐비닛 필터를 붙인다

def read_wav(path):
    b = open(path, 'rb').read(); i = b.find(b'data'); n = struct.unpack('<I', b[i + 4:i + 8])[0]
    return list(struct.unpack('<%df' % (n // 4), b[i + 8:i + 8 + n]))

def write_wav(path, samples):
    data = struct.pack('<%df' % len(samples), *samples)
    with open(path, 'wb') as f:
        f.write(b'RIFF' + struct.pack('<I', 36 + len(data)) + b'WAVE')
        f.write(b'fmt ' + struct.pack('<IHHIIHH', 16, 3, 1, SR, SR * 4, 4, 32))
        f.write(b'data' + struct.pack('<I', len(data)) + data)

def biquad(x, kind, f0, q=0.707, gain_db=0):
    w = 2 * math.pi * f0 / SR; cw, sw = math.cos(w), math.sin(w); al = sw / (2 * q); A = 10 ** (gain_db / 40)
    if kind == 'lp': b0, b1, b2, a0, a1, a2 = (1 - cw) / 2, 1 - cw, (1 - cw) / 2, 1 + al, -2 * cw, 1 - al
    elif kind == 'hp': b0, b1, b2, a0, a1, a2 = (1 + cw) / 2, -(1 + cw), (1 + cw) / 2, 1 + al, -2 * cw, 1 - al
    else: b0, b1, b2, a0, a1, a2 = 1 + al * A, -2 * cw, 1 - al * A, 1 + al / A, -2 * cw, 1 - al / A
    y = []; x1 = x2 = y1 = y2 = 0.0
    for v in x:
        o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1, y2, y1 = x1, v, y1, o; y.append(o)
    return y

def cabinet(x):
    # 4x12 느낌: 저역 정리 + 고역을 가파르게 깎고 중역을 살짝 띄운다
    x = biquad(x, 'hp', 85)
    x = biquad(x, 'peak', 120, 1.0, 2.5)
    x = biquad(x, 'peak', 1800, 1.2, 2.0)
    x = biquad(x, 'lp', 4800, 0.8)
    x = biquad(x, 'lp', 5200, 0.6)
    return x

os.makedirs(f'{S}/tones', exist_ok=True)
for tone, chain in TONES.items():
    notes = []
    for semi in range(49):
        src = f'{S}/di/di-{semi:02d}.wav'
        for step, model in enumerate(chain):
            dst = f'{S}/tones/tmp-{tone}-{step}.wav'
            subprocess.run([BIN, model, src, dst], check=True, capture_output=True)
            src = dst
        y = read_wav(src)
        if tone in CAB: y = cabinet(y)
        y = y[:KEEP] + [0.0] * max(0, KEEP - len(y))
        for i in range(FADE): y[KEEP - FADE + i] *= 0.5 * (1 + math.cos(math.pi * i / FADE))
        notes.append(y)
    # 톤마다 소리 크기를 맞춘다(첫 0.5초 RMS 기준), 피크는 -1dBFS 안으로
    rms = math.sqrt(sum(v * v for n in notes for v in n[:SR // 2]) / (len(notes) * (SR // 2)))
    gain = 0.12 / rms
    peak = max(abs(v) for n in notes for v in n) * gain
    if peak > 0.89: gain *= 0.89 / peak
    sprite = []
    for n in notes: sprite += [v * gain for v in n] + [0.0] * (SLOT - KEEP)
    write_wav(f'{S}/tones/{tone}.wav', sprite)
    print(tone, 'rms %.3f gain %.2f' % (rms, gain), flush=True)
