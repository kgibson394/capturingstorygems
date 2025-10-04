const cron = require("node-cron");
const User = require("../../models/user.js");
const Story = require("../../models/story.js");
const Prompt = require("../../models/prompt.js");
const Subscription = require("../../models/subscription.js");
const { openai } = require("../../configs/openai.js");
const { generateStoryEmail } = require("../../data/emails.js");
const { sendMail } = require("../../utils/send-mail.js");

const createStory = async (req, res) => {
  const userId = req.decoded?.id;
  const { story } = req.body;

  try {
    const user = await User.findById(userId).select("isPublic");
    if (!user.isPublic) {
      const subscription = await Subscription.findOne({
        userId,
        expiryDate: { $gt: new Date() },
      });
      if (!subscription) {
        return res.status(402).json({
          message: "Subscription required to create a story",
          response: null,
          error: "No active subscription",
        });
      }
      if (subscription.storiesCreated >= subscription.storiesAllowed) {
        return res.status(403).json({
          message:
            "You have reached your story limit for this subscription plan",
          response: null,
          error: "You have reached your story limit for this subscription plan",
        });
      }
    }

    const newStory = await Story.create({
      userId,
      user_story: story,
    });

    const promptDoc = await Prompt.findOne({ name: "question-prompt" });
    if (!promptDoc) {
      return res.status(404).json({
        message: "Prompt not found",
        response: null,
        error: "Prompt not found",
      });
    }
    const prompt = `${promptDoc.prompt}\n"${story}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const gptResponse = completion.choices[0]?.message?.content;
    if (!gptResponse) {
      return res.status(500).json({
        message: "Failed to generate questions from AI",
        response: null,
        error: "Failed to generate questions from AI",
      });
    }

    const questionLines = gptResponse
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.\s+/))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    return res.status(201).json({
      message: "Story and questions created successfully",
      response: {
        storyId: newStory._id,
        questions: questionLines,
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

const generateStory = async (req, res) => {
  const { id, email } = req.decoded;
  const { story_id } = req.query;
  const { qa } = req.body;

  try {
    const storyDoc = await Story.findById(story_id);
    if (!storyDoc) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }
    if (storyDoc.userId.toString() !== id) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }

    if (Array.isArray(qa)) {
      storyDoc.qa = qa.map((item) => ({
        question: item.question,
        answer: item.answer || "",
      }));
    }
    await storyDoc.save();

    const answeredQAs = storyDoc.qa
      .filter((item) => item.answer && item.answer.trim().length > 0)
      .map(
        (item, index) =>
          `${index + 1}. Q: ${item.question}\n   A: ${item.answer}`
      )
      .join("\n");

    const promptDoc = await Prompt.findOne({ name: "story-prompt" });
    if (!promptDoc) {
      return res.status(404).json({
        message: "Prompt not found",
        response: null,
        error: "Prompt not found",
      });
    }

    const basePrompt = promptDoc.prompt;
    const storyPart = `User’s Story:\n${storyDoc.user_story}`;
    const qaPart = `User’s Reflections:\n${answeredQAs}`;
    const frameworkPrompt = `
      Return the output in EXACTLY this format (single line, comma separated):
      <Title>, <Genre>, <Time to read>, <Full Story Body>

      Rules:
      - Do not include labels like "Title:" or "Genre:" or "Time to read:".
      - Title should be catchy but relevant.
      - Title must NOT be wrapped in quotation marks or quotes.
      - Genre should be ONE word only (e.g., Fantasy, Romance, Drama).
      - Time to read should be like the time you think would be enough for a reader to read your story for example "2 min read" for a story you think 2 minutes will be enough to read.
      - After the third comma, give the full story narrative.
      - Do not add extra line breaks or commentary before or after.
    `.trim();

    const enhancementPrompt =
      `${storyPart}\n\n${qaPart}\n\nNarrative Instructions:${basePrompt}\n\nLayout & Framework Instructions:${frameworkPrompt}`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: enhancementPrompt }],
      temperature: 0.8,
    });

    let enhancedStory = completion.choices?.[0]?.message?.content;
    if (!enhancedStory) {
      return res.status(500).json({
        message: "AI failed to return enhanced story",
        response: null,
        error: "AI returned no content",
      });
    }
    if (enhancedStory.startsWith(`"`)) enhancedStory = enhancedStory.slice(1);
    if (enhancedStory.endsWith(`"`)) enhancedStory = enhancedStory.slice(0, -1);

    const parts = enhancedStory.split(",");
    const title = (parts[0]?.trim() || "")?.replace(/^["']|["']$/g, "");
    const genre = (parts[1]?.trim() || "")?.replace(/^["']|["']$/g, "");
    const timeRead = (parts[2]?.trim() || "")?.replace(/^["']|["']$/g, "");
    const storyBody = parts.slice(3).join(",").trim();

    storyDoc.story_title = title;
    storyDoc.read_time = timeRead;
    storyDoc.genre = genre;
    storyDoc.enhanced_story = storyBody;
    await storyDoc.save();

    const user = await User.findById(id).select("isPublic");
    if (!user.isPublic) {
      await Subscription.findOneAndUpdate(
        { userId: user._id },
        { $inc: { storiesCreated: 1 } }
      );

      const generatedStory = storyBody
        .replace(/\n\n/g, "<br /><br />")
        .replace(/\n/g, "<br />");
      const dynamicData = {
        subject: "Story generated successfully",
        to_email: email,
      };
      const emailTemplate = await generateStoryEmail(generatedStory);
      await sendMail(emailTemplate, dynamicData);
    }

    return res.status(200).json({
      message: "Story generated successfully",
      response: null,
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

const resendStory = async (req, res) => {
  const { id, email } = req.decoded;
  const { story_id } = req.query;

  try {
    const storyDoc = await Story.findById(story_id);
    if (!storyDoc) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }
    if (storyDoc.userId.toString() !== id) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }

    const generatedStory = storyDoc.enhanced_story
      .replace(/\n\n/g, "<br /><br />")
      .replace(/\n/g, "<br />");

    const dynamicData = {
      subject: "Your Story Has Been Sent",
      to_email: email,
    };
    const emailTemplate = await generateStoryEmail(generatedStory);
    await sendMail(emailTemplate, dynamicData);

    return res.status(200).json({
      message: "Story resent successfully",
      response: null,
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

const getUserStories = async (req, res) => {
  try {
    const { id: userId } = req.decoded;

    const stories = await Story.find({ userId, enhanced_story: { $ne: null } })
      .select("story_title read_time genre enhanced_story user_story")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      message: "Stories fetched successfully",
      response: {
        data: stories,
      },
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

const reviseStory = async (req, res) => {
  const { id } = req.decoded;
  const { storyId } = req.params;
  const { story } = req.body;

  try {
    const storyDoc = await Story.findById(storyId);
    if (!storyDoc) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }
    if (storyDoc.userId.toString() !== id) {
      return res.status(403).json({
        message: "You are not authorized to update this story",
        response: null,
        error: "You are not authorized to update this story",
      });
    }

    storyDoc.enhanced_story = story;
    await storyDoc.save();

    return res.status(200).json({
      message: "Story revised successfully",
      response: null,
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

const deleteStory = async (req, res) => {
  const { id } = req.decoded;
  const { storyId } = req.params;

  try {
    const storyDoc = await Story.findById(storyId);
    if (!storyDoc) {
      return res.status(404).json({
        message: "Story not found",
        response: null,
        error: "Story not found",
      });
    }

    if (storyDoc.userId.toString() !== id) {
      return res.status(403).json({
        message: "You are not authorized to delete this story",
        response: null,
        error: "You are not authorized to delete this story",
      });
    }
    await Story.findByIdAndDelete(storyId);

    const user = await User.findById(id).select("isPublic");
    if (!user?.isPublic) {
      const subscription = await Subscription.findOne({ userId: id }).select(
        "storiesCreated"
      );
      if (subscription && subscription.storiesCreated > 0) {
        await Subscription.findByIdAndUpdate(
          subscription._id,
          { $inc: { storiesCreated: -1 } }
        );
      }
    }

    return res.status(200).json({
      message: "Story deleted successfully",
      response: null,
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

const deleteExpiredPublicStories = async () => {
  try {
    const now = new Date();
    const publicUsers = await User.find({
      isPublic: true,
      storyExpiryDate: { $ne: null },
    }).select("_id storyExpiryDate");

    if (!publicUsers.length) {
      console.log("No public users with storyExpiryDate found");
      return;
    }

    for (const user of publicUsers) {
      if (user.storyExpiryDate < now) {
        const result = await Story.deleteMany({ userId: user._id });
        console.log(
          `Deleted ${result.deletedCount} stories for user ${user._id}`
        );
      }
    }
  } catch (err) {
    console.error("Error deleting old public stories:", err.message);
  }
};

const clearExpiredPublicUserPasswords = async () => {
  try {
    const now = new Date();

    const result = await User.updateMany(
      {
        isPublic: true,
        passwordExpiry: { $ne: null, $lt: now },
      },
      { $set: { password: null } }
    );

    console.log(
      `Cleared passwords for ${result.modifiedCount} expired public users`
    );
  } catch (err) {
    console.error(
      "Error clearing passwords for expired public users:",
      err.message
    );
  }
};

cron.schedule("0 */6 * * *", async () => {
  console.log(
    "Running scheduled job to clear old public user passwords & delete old stories..."
  );
  await deleteExpiredPublicStories();
  await clearExpiredPublicUserPasswords();
});

module.exports = {
  createStory,
  generateStory,
  resendStory,
  getUserStories,
  reviseStory,
  deleteStory,
};
