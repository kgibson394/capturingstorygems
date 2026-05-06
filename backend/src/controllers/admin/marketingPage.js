const MarketingPage = require("../../models/marketingPage.js");
const cloudinary = require("../../configs/cloudinary.util.js");

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

const DEFAULT_CONTENT = {
  hero: {
    backgroundImageUrl: "",
    title: "Begin Memory to Story Experience",
    subtitle: "Starter Kit Free 10-Day Trial",
    description:
      "In the first memory to story practice... we're not asking you to think of your own memory experience yet.",
  },
  practiceStoryOne: {
    label: "Practice Story (1 of 2)",
    title: "Practice 1: Just Experience the Core Process",
    description:
      "In the first memory to story practice... we're not asking you to think of your own memory experience yet. Instead, you'll use a memory example we've created for the first practice story. Our goal with the practice stories is not perfection... it's only to experience the process.",
    videoUrl: "",
  },
  gettingStartedOne: {
    title: "Getting Started",
    subtitle: "Set up your first practice story with our example memory",
    steps: [
      {
        number: "1",
        label: "Step 1 of 7",
        title: "Begin Practice Story 1",
        points: [
          "Click \"Give it a Try\"",
          "The \"Share Your Story\" text box will pop up.",
          "You will be asked to copy and then paste the \"example\" memory narrative into the box.",
        ],
      },
      {
        number: "2",
        label: "Step 2 of 7",
        title: "Copy \"Example\" Memory",
        points: [
          "Below is the \"example\" memory we created for your first practice story.",
          "Click the button to copy it.",
        ],
        copyBlockText:
          "One morning, I was sitting quietly when I heard small footsteps in the hallway. My granddaughter Emma, only three years old, appeared at the doorway holding her favorite stuffed bunny. She walked over to me slowly, climbed onto my lap without saying a word, and nestled against my chest. We sat together in the gentle morning light streaming through the window. After a few moments of silence, she looked up at me with her bright blue eyes and whispered, \"I love you, Grandma.\" Then she hopped down and ran back to play, leaving me with the warmth of that simple, perfect moment that I'll treasure forever.",
      },
      {
        number: "3",
        label: "Step 3 of 7",
        title: "Enter Sample Memory into Text Box",
        points: [
          "Paste the copied memory into the \"Share Your Story\" box. The memory will be analyzed for clarity questions.",
          "Wait about a minute while your memory narrative is analyzed.",
        ],
      },
    ],
  },
  storyDevelopment: {
    title: "Story Development",
    subtitle: "Answer questions and let AI refine your narrative",
    steps: [
      {
        number: "4",
        label: "Step 4 of 7",
        title: "Clarify Your Story",
        points: [
          "After the analysis of the memory narrative... you're presented with 10 questions... if answered they will add more details and clarity to the story.",
          "Now go a little deeper into your memory.",
          "Answer the questions to add details, clarity and meaning. Answer as many as you can.",
          "After the 10th question, click \"Continue\" and let \"Compose\" refine your story.",
        ],
        timeNote: "This step usually takes about a minute.",
      },
      {
        number: "5",
        label: "Step 5 of 7",
        title: "Compose: Integrating, Editing, Smoothing",
        points: [
          "Compose blends in your added details, lightly edits your story, and smooths the flow.",
          "You'll then see your refined story, along with a main title and five additional title options.",
        ],
        timeNote: "This usually takes about a minute.",
      },
    ],
  },
  reviewAndComplete: {
    title: "Review and Complete",
    subtitle: "Polish your story and finish your first practice",
    steps: [
      {
        number: "6",
        label: "Step 6 of 7",
        title: "Review and Revise Story as Desired",
        points: [
          "When your refined story appears, you'll see several options... each starts with a button.",
          "A good first step is to click \"Revise\" to make quick edits.",
          "For bigger changes and for backup, copy the story (and listed title options), then paste it into your own document to continue editing and organizing.",
          "In our subscription support options... we provide a Story Sheet to help you organize, save, and prepare your stories for creating a storybook.",
        ],
      },
      {
        number: "7",
        label: "Step 7 of 7",
        title: "Great Job!",
        points: [
          "Congratulations! You've completed your first practice story using CSG's core memory-to-story process.",
          "In Practice 2, this time, instead of using a provided example, you'll use your own memory experience.",
        ],
      },
    ],
  },
  practiceStoryTwo: {
    label: "Practice Story (2 of 2)",
    title: "Practice 2: Use Your Own Memory",
    description:
      "Now it's time to use your own memory experience. Follow the same process, but this time with a memory that's meaningful to you.",
    videoUrl: "",
  },
  gettingStartedTwo: {
    title: "Getting Started",
    subtitle: "Begin your personal memory journey",
    steps: [
      {
        number: "1",
        label: "Step 1 of 6",
        title: "Begin Practice Story 2",
        points: [
          "Click \"Give it a Try\" to start your second practice story.",
          "This time, you'll share your own memory in the \"Share Your Story\" text box.",
        ],
      },
      {
        number: "2",
        label: "Step 2 of 6",
        title: "Think of Your Own Memory",
        points: [
          "Take a moment to recall a memory that's meaningful to you.",
          "It can be simple or significant - what matters is that it holds personal meaning.",
          "Type your memory into the text box when you're ready.",
        ],
      },
      {
        number: "3",
        label: "Step 3 of 6",
        title: "Submit Your Memory",
        points: ["Once you've written your memory, submit it for analysis."],
        timeNote: "Wait about a minute while your memory narrative is analyzed.",
      },
    ],
  },
  refiningYourStory: {
    title: "Refining Your Story",
    subtitle: "Add depth and let AI enhance your narrative",
    steps: [
      {
        number: "4",
        label: "Step 4 of 6",
        title: "Answer Clarity Questions",
        points: [
          "You'll be presented with personalized questions based on your memory.",
          "Answer as many questions as you can to add depth and detail to your story.",
          "After completing the questions, click \"Continue\" to let Compose refine your story.",
        ],
      },
      {
        number: "5",
        label: "Step 5 of 6",
        title: "Review Your Personal Story",
        points: [
          "Compose will integrate your answers and create a polished version of your memory.",
          "You'll receive your refined story along with title suggestions.",
          "This is your story, preserved and enhanced.",
        ],
      },
    ],
  },
  complete: {
    title: "Complete",
    subtitle: "Save and celebrate your achievement",
    steps: [
      {
        number: "6",
        label: "Step 6 of 6",
        title: "Save and Share",
        points: [
          "Review your story and make any final revisions you'd like.",
          "Consider copying it to your own document for safekeeping.",
          "You've now experienced the complete memory-to-story process with your own memory!",
        ],
      },
    ],
  },
  learningCenter: {
    label: "Learning Center",
    title: "CSG Learning Center - Free 10-Day Trial",
    description:
      "Great work completing your practice stories. Start your free Learning Center trial and follow these steps to continue your story journey.",
    paragraphs: [
      "Great work completing your practice stories... this is an important step.",
      "To continue, create your free account in the Capturing Story Gems - Learning Center.",
      "Your 10-day trial gives you access to guided modules with lessons and activities, all organized and ready for you.",
    ],
    videoUrl: "",
    steps: [
      {
        number: "1",
        label: "Step 1 of 4",
        title: "Create Your Learning Center Account",
        points: [
          "Use your active email address to create your free 10-day trial account.",
          "Complete the required registration details and submit the form.",
        ],
      },
      {
        number: "2",
        label: "Step 2 of 4",
        title: "Verify Your Email",
        points: [
          "Open the verification email sent to your inbox.",
          "Enter the verification code to activate your account.",
        ],
      },
      {
        number: "3",
        label: "Step 3 of 4",
        title: "Open Starter Modules",
        points: [
          "Go to your dashboard and open the starter learning modules.",
          "Review the guided lessons and activities in order.",
        ],
      },
      {
        number: "4",
        label: "Step 4 of 4",
        title: "Begin Your Next Story Session",
        points: [
          "Choose one memory activity and complete your first session.",
          "Save your progress so you can continue building your storybook.",
        ],
      },
    ],
    accountSetup: {
      title: "Account Setup",
      subtitle: "Quick and easy registration to access your learning modules",
      steps: [
        {
          number: "1",
          label: "Step 1 of 2",
          title: "Create a New Account",
          points: [
            "Here's how to Access Your \"10-Day Trial\" Learning Modules at CSG's Learning Center",
          ],
        },
        {
          number: "2",
          label: "Step 2 of 2",
          title: "Verify Active Email",
          points: [
            "After creating your Learning Center account, you'll verify your email.",
            "Click the verify button, check your email for the code, and enter it.",
            "You now have access to the Starter Kit Learning Modules.",
          ],
        },
      ],
    },
  },
};

async function getOrCreateDoc() {
  let doc = await MarketingPage.findOne({ key: "default" });
  if (!doc) {
    doc = await MarketingPage.create({ key: "default", content: DEFAULT_CONTENT });
  } else {
    const merged = deepMerge(DEFAULT_CONTENT, doc.content || {});
    if (!doc.content || Object.keys(doc.content).length === 0 || JSON.stringify(merged) !== JSON.stringify(doc.content)) {
      doc.content = merged;
      await doc.save();
    }
  }
  return doc;
}

const getMarketingPage = async (req, res) => {
  try {
    const doc = await getOrCreateDoc();
    return res.status(200).json({
      message: "Marketing page fetched successfully",
      response: { data: doc.content, updatedAt: doc.updatedAt },
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

const updateMarketingPage = async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!content || typeof content !== "object") {
      return res.status(400).json({
        message: "content is required",
        response: null,
        error: "Missing content",
      });
    }

    const merged = deepMerge(DEFAULT_CONTENT, content);
    const doc = await MarketingPage.findOneAndUpdate(
      { key: "default" },
      { $set: { content: merged } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Marketing page updated successfully",
      response: { data: doc.content, updatedAt: doc.updatedAt },
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

const uploadMarketingPageImage = async (req, res) => {
  try {
    const { image, folder } = req.body || {};
    if (typeof image !== "string" || image.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "image is required", response: null, error: "Missing image" });
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder:
        typeof folder === "string" && folder.trim()
          ? folder.trim()
          : "marketing_page",
    });

    return res.status(200).json({
      message: "Image uploaded",
      response: { url: uploadRes.secure_url },
      error: null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", response: null, error: error.message });
  }
};

module.exports = {
  DEFAULT_CONTENT,
  getMarketingPage,
  updateMarketingPage,
  uploadMarketingPageImage,
};
