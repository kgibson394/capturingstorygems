const axios = require("axios");
const { PDFDocument } = require("pdf-lib");

const PTS_PER_INCH = 72;

/** Lulu trim codes → width × height in inches (no bleed). */
const TRIM_SIZE_MAP = {
  "0600X0900": { widthIn: 6.0, heightIn: 9.0, label: "US Trade (6.00 × 9.00 in)" },
  "0700X1000": { widthIn: 7.0, heightIn: 10.0, label: "Executive (7.00 × 10.00 in)" },
  "0744X0968": { widthIn: 7.44, heightIn: 9.68, label: "Crown Quarto (7.44 × 9.68 in)" },
  "0614X0921": { widthIn: 6.14, heightIn: 9.21, label: "Royal (6.14 × 9.21 in)" },
};

/**
 * Extract trim code (e.g. 0600X0900) from a Lulu POD package id.
 */
function extractTrimCode(podPackageId) {
  if (!podPackageId) return null;
  const m = String(podPackageId).match(/(\d{4}X\d{4})/i);
  return m ? m[1].toUpperCase() : null;
}

function getTrimInfo(trimCode) {
  if (!trimCode) return null;
  const key = String(trimCode).toUpperCase();
  if (TRIM_SIZE_MAP[key]) return { code: key, ...TRIM_SIZE_MAP[key] };

  const parts = key.split(/[xX]/).map((p) => parseFloat(p));
  if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    const widthIn = parts[0] / 100;
    const heightIn = parts[1] / 100;
    return {
      code: key,
      widthIn,
      heightIn,
      label: `${widthIn.toFixed(2)} × ${heightIn.toFixed(2)} in`,
    };
  }
  return null;
}

/**
 * Resolve trim width/height (inches) from a POD package id.
 * Falls back to null when trim cannot be parsed (caller should reject).
 */
function resolveTrimInches(podPackageId) {
  const trimCode = extractTrimCode(podPackageId);
  const info = getTrimInfo(trimCode);
  if (!info) return null;
  return { trimCode: info.code, widthIn: info.widthIn, heightIn: info.heightIn, label: info.label };
}

/**
 * Expected interior PDF page size in PDF points (matches generateBookPdf logic).
 */
function getExpectedPageSizePoints(podPackageId) {
  const trim = resolveTrimInches(podPackageId);
  if (!trim) return null;

  const needsBleed = String(podPackageId).includes("FC");
  const finalWidthIn = needsBleed ? trim.widthIn + 0.125 : trim.widthIn;
  const finalHeightIn = needsBleed ? trim.heightIn + 0.25 : trim.heightIn;

  return {
    trimCode: trim.trimCode,
    trimLabel: trim.label,
    widthPt: finalWidthIn * PTS_PER_INCH,
    heightPt: finalHeightIn * PTS_PER_INCH,
    widthIn: finalWidthIn,
    heightIn: finalHeightIn,
  };
}

function dimensionsMatchPoints(actualW, actualH, expectedW, expectedH, tolerancePt = 4) {
  const pairs = [
    [actualW, actualH],
    [actualH, actualW],
  ];
  return pairs.some(
    ([w, h]) =>
      Math.abs(w - expectedW) <= tolerancePt && Math.abs(h - expectedH) <= tolerancePt
  );
}

async function getPdfPageSizeFromBuffer(buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const pages = doc.getPages();
  if (!pages.length) return null;
  const page = pages[0];
  return { widthPt: page.getWidth(), heightPt: page.getHeight(), pageCount: pages.length };
}

async function getPdfPageSizeFromUrl(url) {
  const resp = await axios.get(url, {
    responseType: "arraybuffer",
    params: { _t: Date.now() },
    headers: { "Cache-Control": "no-cache" },
  });
  const ab = resp.data;
  const buffer = Buffer.isBuffer(ab) ? ab : Buffer.from(ab);
  return getPdfPageSizeFromBuffer(buffer);
}

/**
 * Verify remote interior PDF page dimensions match the selected POD package.
 */
async function validatePdfMatchesPodPackage(pdfUrl, podPackageId, { tolerancePt = 4 } = {}) {
  if (!pdfUrl) {
    return { ok: false, message: "PDF URL is required for dimension validation." };
  }
  if (!podPackageId) {
    return { ok: false, message: "pod_package_id is required for dimension validation." };
  }

  const expected = getExpectedPageSizePoints(podPackageId);
  if (!expected) {
    return {
      ok: false,
      message: `Unknown trim size in POD package id "${podPackageId}".`,
    };
  }

  let actual;
  try {
    actual = await getPdfPageSizeFromUrl(pdfUrl);
  } catch (err) {
    return {
      ok: false,
      message: `Could not read PDF dimensions: ${err?.message || err}`,
    };
  }

  if (!actual) {
    return { ok: false, message: "PDF has no pages or dimensions could not be read." };
  }

  const matches = dimensionsMatchPoints(
    actual.widthPt,
    actual.heightPt,
    expected.widthPt,
    expected.heightPt,
    tolerancePt
  );

  if (matches) {
    return {
      ok: true,
      expected,
      actual,
      trimCode: expected.trimCode,
    };
  }

  const actualIn = `${(actual.widthPt / PTS_PER_INCH).toFixed(2)} × ${(actual.heightPt / PTS_PER_INCH).toFixed(2)} in`;
  const expectedIn = `${expected.widthIn.toFixed(2)} × ${expected.heightIn.toFixed(2)} in`;

  return {
    ok: false,
    message:
      `Interior PDF size (${actualIn}) does not match the selected book format ` +
      `${expected.trimLabel} (${expectedIn}) for POD "${podPackageId}". ` +
      `Regenerate the PDF after choosing the correct book size, then add to cart again.`,
    expected,
    actual,
    trimCode: expected.trimCode,
  };
}

module.exports = {
  TRIM_SIZE_MAP,
  PTS_PER_INCH,
  extractTrimCode,
  getTrimInfo,
  resolveTrimInches,
  getExpectedPageSizePoints,
  getPdfPageSizeFromBuffer,
  getPdfPageSizeFromUrl,
  validatePdfMatchesPodPackage,
};
