const PublicStory = require("../../models/public-story.js");

const createPublicStory = async (req, res) => {
  try {
    const { author, title, story } = req.body;

    const newStory = new PublicStory({
      author,
      title,
      story,
    });
    await newStory.save();

    return res.status(201).json({
      message: "Story created successfully",
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

const getAllPublicStories = async (req, res) => {
  try {
    const publicStory = await PublicStory.find().lean({ virtuals: true });

    return res.status(200).json({
      message: "All stories returned successfully",
      response: {
        data: {
          publicStory,
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

const getPublicStories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    const publicStoriesCount = await PublicStory.countDocuments();
    const totalPages = Math.ceil(publicStoriesCount / pageSize);

    const publicStory = await PublicStory.find()
      .skip(offset)
      .limit(pageSize)
      .lean({ virtuals: true });

    return res.status(200).json({
      message: "Stories returned successfully",
      response: {
        data: {
          publicStory,
          total: publicStoriesCount,
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

const updateStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { author, title, story } = req.body;

    const storyExist = await PublicStory.findById(storyId);
    if (!storyExist) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }

    await PublicStory.findByIdAndUpdate(storyId, {
      author,
      title,
      story,
    });

    return res.status(200).json({
      message: "Story updated successfully",
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

const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await PublicStory.findByIdAndDelete(storyId);
    if (!story) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }

    return res.status(200).json({
      message: "Story deleted successfully",
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
  createPublicStory,
  getAllPublicStories,
  getPublicStories,
  updateStory,
  deleteStory,
};
