const LandingPage = require("../../models/landingPage.js");
const { DEFAULT_CONTENT } = require("../admin/landingPage.js");

function deepMerge(base, override) {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (typeof base !== "object" || base === null) return override;
  const out = { ...base };
  if (typeof override !== "object" || override === null) return out;
  for (const [key, value] of Object.entries(override)) {
    if (Object.prototype.hasOwnProperty.call(out, key)) out[key] = deepMerge(out[key], value);
    else out[key] = value;
  }
  return out;
}

// GET /user/landing-page (public)
const getLandingPagePublic = async (req, res) => {
  try {
    const doc = await LandingPage.findOne({ key: "default" }).lean();
    const stored = doc?.content && Object.keys(doc.content).length ? doc.content : {};
    const data = deepMerge(DEFAULT_CONTENT, stored);

    return res.status(200).json({
      message: "Landing page fetched successfully",
      response: { data, updatedAt: doc?.updatedAt || null },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      response: null,
      error: error.message,
    });
  }
};

module.exports = {
  getLandingPagePublic,
};
