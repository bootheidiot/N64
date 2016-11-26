const kOneToEight = [
  0x00, // 0 -> 00 00 00 00
  0xff, // 1 -> 11 11 11 11
];

const kThreeToEight = [
  0x00, // 000 -> 00 00 00 00
  0x24, // 001 -> 00 10 01 00
  0x49, // 010 -> 01 00 10 01
  0x6d, // 011 -> 01 10 11 01
  0x92, // 100 -> 10 01 00 10
  0xb6, // 101 -> 10 11 01 10
  0xdb, // 110 -> 11 01 10 11
  0xff, // 111 -> 11 11 11 11
];

const kFourToEight = [
  0x00, 0x11, 0x22, 0x33,
  0x44, 0x55, 0x66, 0x77,
  0x88, 0x99, 0xaa, 0xbb,
  0xcc, 0xdd, 0xee, 0xff,
];

const kFiveToEight = [
  0x00, // 00000 -> 00000000
  0x08, // 00001 -> 00001000
  0x10, // 00010 -> 00010000
  0x18, // 00011 -> 00011000
  0x21, // 00100 -> 00100001
  0x29, // 00101 -> 00101001
  0x31, // 00110 -> 00110001
  0x39, // 00111 -> 00111001
  0x42, // 01000 -> 01000010
  0x4a, // 01001 -> 01001010
  0x52, // 01010 -> 01010010
  0x5a, // 01011 -> 01011010
  0x63, // 01100 -> 01100011
  0x6b, // 01101 -> 01101011
  0x73, // 01110 -> 01110011
  0x7b, // 01111 -> 01111011

  0x84, // 10000 -> 10000100
  0x8c, // 10001 -> 10001100
  0x94, // 10010 -> 10010100
  0x9c, // 10011 -> 10011100
  0xa5, // 10100 -> 10100101
  0xad, // 10101 -> 10101101
  0xb5, // 10110 -> 10110101
  0xbd, // 10111 -> 10111101
  0xc6, // 11000 -> 11000110
  0xce, // 11001 -> 11001110
  0xd6, // 11010 -> 11010110
  0xde, // 11011 -> 11011110
  0xe7, // 11100 -> 11100111
  0xef, // 11101 -> 11101111
  0xf7, // 11110 -> 11110111
  0xff, // 11111 -> 11111111
];

export function convertIA16Pixel(v) {
  var i = (v >>> 8) & 0xff;
  let a = (v) & 0xff;

  return (i << 24) | (i << 16) | (i << 8) | a;
}

export function convertRGBA16Pixel(v) {
  let r = kFiveToEight[(v >>> 11) & 0x1f];
  let g = kFiveToEight[(v >>> 6) & 0x1f];
  let b = kFiveToEight[(v >>> 1) & 0x1f];
  let a = ((v) & 0x01) ? 255 : 0;

  return (r << 24) | (g << 16) | (b << 8) | a;
}

export function convertRGBA32(dstData, srcData, tmem, line, width, height) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  // NB! RGBA/32 line needs to be doubled.
  srcRowStride *= 2;

  let rowSwizzle = 0;
  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    for (let x = 0; x < width; ++x) {
      let o = srcOffset ^ rowSwizzle;

      dst[dstOffset + 0] = src[o];
      dst[dstOffset + 1] = src[o + 1];
      dst[dstOffset + 2] = src[o + 2];
      dst[dstOffset + 3] = src[o + 3];

      srcOffset += 4;
      dstOffset += 4;
    }
    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertRGBA16(dstData, srcData, tmem, line, width, height) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let rowSwizzle = 0;
  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    for (let x = 0; x < width; ++x) {
      let o = srcOffset ^ rowSwizzle;
      let srcPixel = (src[o] << 8) | src[o + 1];

      dst[dstOffset + 0] = kFiveToEight[(srcPixel >>> 11) & 0x1f];
      dst[dstOffset + 1] = kFiveToEight[(srcPixel >>> 6) & 0x1f];
      dst[dstOffset + 2] = kFiveToEight[(srcPixel >>> 1) & 0x1f];
      dst[dstOffset + 3] = ((srcPixel) & 0x01) ? 255 : 0;

      srcOffset += 2;
      dstOffset += 4;
    }
    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertIA16(dstData, srcData, tmem, line, width, height) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let rowSwizzle = 0;
  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    for (let x = 0; x < width; ++x) {
      let o = srcOffset ^ rowSwizzle;
      let i = src[o];
      let a = src[o + 1];

      dst[dstOffset + 0] = i;
      dst[dstOffset + 1] = i;
      dst[dstOffset + 2] = i;
      dst[dstOffset + 3] = a;

      srcOffset += 2;
      dstOffset += 4;
    }
    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertIA8(dstData, srcData, tmem, line, width, height) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let rowSwizzle = 0;
  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    for (let x = 0; x < width; ++x) {
      let o = srcOffset ^ rowSwizzle;
      let srcPixel = src[o];

      let i = kFourToEight[(srcPixel >>> 4) & 0xf];
      let a = kFourToEight[(srcPixel) & 0xf];

      dst[dstOffset + 0] = i;
      dst[dstOffset + 1] = i;
      dst[dstOffset + 2] = i;
      dst[dstOffset + 3] = a;

      srcOffset += 1;
      dstOffset += 4;
    }
    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertIA4(dstData, srcData, tmem, line, width, height) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let rowSwizzle = 0;

  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    // Process 2 pixels at a time
    for (let x = 0; x + 1 < width; x += 2) {

      let o = srcOffset ^ rowSwizzle;
      let srcPixel = src[o];

      let i0 = kThreeToEight[(srcPixel & 0xe0) >>> 5];
      let a0 = kOneToEight[(srcPixel & 0x10) >>> 4];

      let i1 = kThreeToEight[(srcPixel & 0x0e) >>> 1];
      let a1 = kOneToEight[(srcPixel & 0x01) >>> 0];

      dst[dstOffset + 0] = i0;
      dst[dstOffset + 1] = i0;
      dst[dstOffset + 2] = i0;
      dst[dstOffset + 3] = a0;

      dst[dstOffset + 4] = i1;
      dst[dstOffset + 5] = i1;
      dst[dstOffset + 6] = i1;
      dst[dstOffset + 7] = a1;

      srcOffset += 1;
      dstOffset += 8;
    }

    // Handle trailing pixel, if odd width
    if (width & 1) {
      let o = srcOffset ^ rowSwizzle;
      let srcPixel = src[o];

      let i0 = kThreeToEight[(srcPixel & 0xe0) >>> 5];
      let a0 = kOneToEight[(srcPixel & 0x10) >>> 4];

      dst[dstOffset + 0] = i0;
      dst[dstOffset + 1] = i0;
      dst[dstOffset + 2] = i0;
      dst[dstOffset + 3] = a0;

      srcOffset += 1;
      dstOffset += 4;
    }

    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertI8(dstData, srcData, tmem, line, width, height) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let rowSwizzle = 0;
  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    for (let x = 0; x < width; ++x) {
      let i = src[srcOffset ^ rowSwizzle];

      dst[dstOffset + 0] = i;
      dst[dstOffset + 1] = i;
      dst[dstOffset + 2] = i;
      dst[dstOffset + 3] = i;

      srcOffset += 1;
      dstOffset += 4;
    }
    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertI4(dstData, srcData, tmem, line, width, height) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let rowSwizzle = 0;

  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    // Process 2 pixels at a time
    for (let x = 0; x + 1 < width; x += 2) {
      let srcPixel = src[srcOffset ^ rowSwizzle];
      let i0 = kFourToEight[(srcPixel & 0xf0) >>> 4];
      let i1 = kFourToEight[(srcPixel & 0x0f) >>> 0];

      dst[dstOffset + 0] = i0;
      dst[dstOffset + 1] = i0;
      dst[dstOffset + 2] = i0;
      dst[dstOffset + 3] = i0;

      dst[dstOffset + 4] = i1;
      dst[dstOffset + 5] = i1;
      dst[dstOffset + 6] = i1;
      dst[dstOffset + 7] = i1;

      srcOffset += 1;
      dstOffset += 8;
    }

    // Handle trailing pixel, if odd width
    if (width & 1) {
      let srcPixel = src[srcOffset ^ rowSwizzle];
      let i0 = kFourToEight[(srcPixel & 0xf0) >>> 4];

      dst[dstOffset + 0] = i0;
      dst[dstOffset + 1] = i0;
      dst[dstOffset + 2] = i0;
      dst[dstOffset + 3] = i0;

      srcOffset += 1;
      dstOffset += 4;
    }

    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertCI8(dstData, srcData, tmem, line, width, height, palAddress, palConv) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let palOffset = palAddress << 3;
  let pal = new Uint32Array(256);

  for (let i = 0; i < 256; ++i) {
    let srcPixel = (src[palOffset + i * 2 + 0] << 8) | src[palOffset + i * 2 +
      1];
    pal[i] = palConv(srcPixel);
  }

  let rowSwizzle = 0;
  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    for (let x = 0; x < width; ++x) {
      let srcPixel = pal[src[srcOffset ^ rowSwizzle]];

      dst[dstOffset + 0] = (srcPixel >> 24) & 0xff;
      dst[dstOffset + 1] = (srcPixel >> 16) & 0xff;
      dst[dstOffset + 2] = (srcPixel >> 8) & 0xff;
      dst[dstOffset + 3] = (srcPixel) & 0xff;

      srcOffset += 1;
      dstOffset += 4;
    }
    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}

export function convertCI4(dstData, srcData, tmem, line, width, height, palAddress, palConv) {
  let dst = dstData.data;
  let dstRowStride = dstData.width * 4; // Might not be the same as width, due to power of 2
  let dstRowOffset = 0;

  let src = srcData;
  let srcRowStride = line << 3;
  let srcRowOffset = tmem << 3;

  let palOffset = palAddress << 3;
  let pal = new Uint32Array(16);

  for (let i = 0; i < 16; ++i) {
    let srcPixel = (src[palOffset + i * 2 + 0] << 8) | src[palOffset + i * 2 +
      1];
    pal[i] = palConv(srcPixel);
  }

  let rowSwizzle = 0;

  for (let y = 0; y < height; ++y) {
    let srcOffset = srcRowOffset;
    let dstOffset = dstRowOffset;

    // Process 2 pixels at a time
    for (let x = 0; x + 1 < width; x += 2) {
      let srcPixel = src[srcOffset ^ rowSwizzle];
      let c0 = pal[(srcPixel & 0xf0) >>> 4];
      let c1 = pal[(srcPixel & 0x0f) >>> 0];

      dst[dstOffset + 0] = (c0 >> 24) & 0xff;
      dst[dstOffset + 1] = (c0 >> 16) & 0xff;
      dst[dstOffset + 2] = (c0 >> 8) & 0xff;
      dst[dstOffset + 3] = (c0) & 0xff;

      dst[dstOffset + 4] = (c1 >> 24) & 0xff;
      dst[dstOffset + 5] = (c1 >> 16) & 0xff;
      dst[dstOffset + 6] = (c1 >> 8) & 0xff;
      dst[dstOffset + 7] = (c1) & 0xff;

      srcOffset += 1;
      dstOffset += 8;
    }

    // Handle trailing pixel, if odd width
    if (width & 1) {
      let srcPixel = src[srcOffset ^ rowSwizzle];
      let c0 = pal[(srcPixel & 0xf0) >>> 4];

      dst[dstOffset + 0] = (c0 >> 24) & 0xff;
      dst[dstOffset + 1] = (c0 >> 16) & 0xff;
      dst[dstOffset + 2] = (c0 >> 8) & 0xff;
      dst[dstOffset + 3] = (c0) & 0xff;

      srcOffset += 1;
      dstOffset += 4;
    }

    srcRowOffset += srcRowStride;
    dstRowOffset += dstRowStride;

    rowSwizzle ^= 0x4; // Alternate lines are word-swapped
  }
}