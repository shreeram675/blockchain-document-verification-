const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const from = path.join(__dirname, "..", "public", "_redirects");
const toDir = path.join(__dirname, "..", "dist");
const to = path.join(toDir, "_redirects");

if (!fs.existsSync(from)) {
  console.log(`[postbuild] Skipping: missing ${from}`);
  process.exit(0);
}

fs.mkdirSync(toDir, { recursive: true });
fs.copyFileSync(from, to);
console.log(`[postbuild] Copied ${from} -> ${to}`);

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng16(colorRgba) {
  const width = 16;
  const height = 16;

  // Each scanline: filter byte + RGBA pixels
  const stride = 1 + width * 4;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const offset = y * stride + 1 + x * 4;
      raw[offset] = colorRgba[0];
      raw[offset + 1] = colorRgba[1];
      raw[offset + 2] = colorRgba[2];
      raw[offset + 3] = colorRgba[3];
    }
  }

  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const idatData = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idatData),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function generateIcoFromPng(pngBytes) {
  // ICO header: reserved(0), type(1), count(1)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  // Directory entry (16 bytes)
  const entry = Buffer.alloc(16);
  entry[0] = 16; // width
  entry[1] = 16; // height
  entry[2] = 0; // colors (0 = no palette)
  entry[3] = 0; // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(pngBytes.length, 8); // bytes in resource
  entry.writeUInt32LE(6 + 16, 12); // image offset

  return Buffer.concat([header, entry, pngBytes]);
}

const faviconPath = path.join(toDir, "favicon.ico");
if (!fs.existsSync(faviconPath)) {
  // Indigo-ish solid square, opaque
  const png = generatePng16([79, 70, 229, 255]);
  const ico = generateIcoFromPng(png);
  fs.writeFileSync(faviconPath, ico);
  console.log(`[postbuild] Generated ${faviconPath}`);
}
