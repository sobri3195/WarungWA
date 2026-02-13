import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const targets = [
  { file: 'thumbnail-80x80.png', expected: [80, 80] },
  { file: 'preview-590x300.png', expected: [590, 300] },
  { file: 'preview-590x300.jpg', expected: [590, 300] },
];

function readPngSize(buf) {
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  if (!buf.subarray(0, 8).equals(sig)) throw new Error('invalid PNG signature');
  if (buf.subarray(12, 16).toString() !== 'IHDR') throw new Error('missing IHDR');
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return [w, h];
}

function readJpegSize(buf) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) throw new Error('invalid JPEG signature');
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    if ([0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF].includes(marker)) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return [w, h];
    }
    if (marker === 0xDA) break;
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  throw new Error('SOF marker not found');
}

let failed = false;
for (const t of targets) {
  const p = path.join(root, t.file);
  const buf = fs.readFileSync(p);
  const size = t.file.endsWith('.png') ? readPngSize(buf) : readJpegSize(buf);
  const ok = size[0] === t.expected[0] && size[1] === t.expected[1];
  console.log(`${ok ? 'OK' : 'FAIL'} ${t.file}: ${size[0]}x${size[1]} (expected ${t.expected[0]}x${t.expected[1]})`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
