const Prompt = require("../../models/prompt");

const getPrompts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    const promptsCount = await Prompt.countDocuments();
    const totalPages = Math.ceil(promptsCount / pageSize);

    const prompts = await Prompt.find({})
      .skip(offset)
      .limit(pageSize)
      .lean({ virtuals: true });

    return res.status(200).json({
      message: "Prompts returned successfully",
      response: {
        data: {
          prompts,
          total: promptsCount,
          page,
          pageSize,
          totalPages,
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

const editPrompt = async (req, res) => {
  try {
    const { promptId } = req.params;
    const { prompt } = req.body;

    const updatedPrompt = await Prompt.findByIdAndUpdate(
      promptId,
      {
        prompt,
      },
      { new: true }
    );
    if (!updatedPrompt) {
      return res.status(404).json({
        message: "Prompt not found",
        response: null,
        error: "Prompt not found",
      });
    }

    return res.status(200).json({
      message: "Prompt updated successfully",
      response: null,
      error: null,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      response: null,
      error: err.message,
    });
  }
};

module.exports = {
  getPrompts,
  editPrompt,
};
