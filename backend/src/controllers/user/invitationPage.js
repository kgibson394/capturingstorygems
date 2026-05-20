const InvitationPage = require("../../models/invitationPage.js");

const DEFAULT_KEY = "default";

const getInvitationPagePublic = async (req, res) => {
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

module.exports = {
  getInvitationPagePublic,
};
