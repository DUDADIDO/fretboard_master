import { readFileSync, writeFileSync } from 'node:fs';
import { Mp3Encoder } from '@breezystack/lamejs';
const [input, output, kbps = '112'] = process.argv.slice(2);
const b = readFileSync(input);
const i = b.indexOf('data');
const n = b.readUInt32LE(i + 4) / 4;
const pcm = new Int16Array(n);
for (let k = 0; k < n; k += 1) pcm[k] = Math.max(-1, Math.min(1, b.readFloatLE(i + 8 + k * 4))) * 32767;
const enc = new Mp3Encoder(1, 48000, Number(kbps));
const chunks = [];
for (let k = 0; k < n; k += 1152) { const c = enc.encodeBuffer(pcm.subarray(k, k + 1152)); if (c.length) chunks.push(Buffer.from(c)); }
chunks.push(Buffer.from(enc.flush()));
writeFileSync(output, Buffer.concat(chunks));
