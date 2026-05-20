const InvitationPage = require("../../models/invitationPage.js");

const DEFAULT_KEY = "default";

function ensureLinksOpenInNewTab(html) {
  if (!html) return "";
  return html.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    let next = attrs || "";
    if (!/\btarget\s*=/i.test(next)) {
      next += ' target="_blank"';
    }
    if (!/\brel\s*=/i.test(next)) {
      next += ' rel="noopener noreferrer"';
    }
    return `<a${next}>`;
  });
}

const getInvitationPage = async (req, res) => {
  try {
    const key = String(req.query.key || DEFAULT_KEY).trim() || DEFAULT_KEY;

    const doc = await InvitationPage.findOne({ key }).lean();

    return res.status(200).json({
      message: "Invitation page fetched successfully",
      response: {
        data: {
          key,
          title: doc?.title || "",
          html: doc?.html || "",
          updatedAt: doc?.updatedAt || null,
        },
      },
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

const upsertInvitationPage = async (req, res) => {
  try {
    const key = String(req.body?.key || DEFAULT_KEY).trim() || DEFAULT_KEY;
    const title = String(req.body?.title || "");
    const html = ensureLinksOpenInNewTab(String(req.body?.html || ""));

    const doc = await InvitationPage.findOneAndUpdate(
      { key },
      { $set: { title, html } },
      { new: true, upsert: true }
    ).lean();

    return res.status(200).json({
      message: "Invitation page saved successfully",
      response: {
        data: {
          key: doc.key,
          title: doc.title || "",
          html: doc.html || "",
          updatedAt: doc.updatedAt || null,
        },
      },
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
  getInvitationPage,
  upsertInvitationPage,
};
