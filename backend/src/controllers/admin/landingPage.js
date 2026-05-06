const LandingPage = require("../../models/landingPage.js");
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
  navbar: {
    logoUrl: "",
    menuItems: ["Features", "Pricing", "About"],
    ctaText: "Get Started",
  },
  hero: {
    badgeText: "STORY GEMS — MEMORY PRESERVATION",
    mainHeading: "Capture the Stories That Matter Most Before They Fade",
    subHeading:
      "A simple, guided process that helps you turn meaningful memory moments into stories your family will treasure.",
    button1Text: "Download the FREE Story Starter Kit",
    button2Text: "Watch Demo",
    smallPoints: ["No writing experience needed", "Free to start", "4,200+ families"],
    videoUrl: "",
    backgroundImageUrl: "",
  },
  startWithOneMemory: {
    eyebrowText: "Introduction",
    title: "Start with One Memory",
    description: "Experience Story Gems for Yourself",
    checklistItems: ["You don't need to be a writer", "Memories don't need to be perfect", "Stories form naturally without pressure"],
    ctaText: "Download the FREE Starter Kit",
    videoCaption: "Keith Gibson — Introduction to Story Gems",
    imageUrl: "",
    videoUrl: "",
  },
  watchMemory: {
    eyebrowText: "See it in Action",
    title: "Watch Your Memory Become a Story",
    videoUrl: "",
    thumbnailUrl: "",
    timelineSteps: ["A memory is shared", "Prompts surface details", "A story is born"],
    videoCaption: "See the full Story Gems transformation",
  },
  features: {
    eyebrowText: "Why Story Gems",
    title: "What Makes Story Gems Special",
    cards: [
      {
        title: "Awaken the Memory... Not the Writer",
        description: "Focus on feelings, moments, and natural memory triggers — not grammar or writing skill.",
        imageUrl: "",
      },
      {
        title: "Compose... Capturing the True Experience",
        description: "AI-assisted process that amplifies your authentic voice while keeping every story uniquely yours.",
        imageUrl: "",
      },
      {
        title: "Storybooks Made Simple",
        description: "Turn your stories into beautiful digital PDFs or printed keepsakes your family will cherish forever.",
        imageUrl: "",
      },
    ],
  },
  learning: {
    eyebrowText: "Full Overview · 17 Min",
    title: "Learn the Who, What, Why, and How Behind Story Gems",
    description:
      "The origin story of Story Gems and why it was created\nHow our guided process works for all skill levels\nWhat you'll create and why it matters for future generations\nThe technology behind story preservation and book creation",
    imageUrl: "",
    videoUrl: "",
    videoCaption: "Full Story Gems Overview Presentation (17 min)",
    listHeading: "In This Presentation",
    presentationPoints: [
      "The origin story of Story Gems and why it was created",
      "How our guided process works for all skill levels",
      "What you'll create and why it matters for future generations",
      "The technology behind story preservation and book creation",
    ],
  },
  support: {
    eyebrowText: "Support System",
    title: "Support Every Step of the Way",
    cards: [
      {
        badgeText: "24/7 ACCESS",
        title: "Learn at Your Own Pace",
        description:
          "Access all lessons, prompts, and story tools anytime, anywhere. No schedules — just progress on your terms.",
        imageUrl: "",
        videoLabel: "Online Learning",
        videoUrl: "",
      },
      {
        badgeText: "GUIDED PROGRAM ONLY",
        title: "Real-Time Coaching & Community",
        description:
          "Join weekly group sessions with a Story Gems guide. Ask questions, share stories, and stay motivated together.",
        imageUrl: "",
        videoLabel: "Weekly Live Sessions",
        videoUrl: "",
      },
    ],
  },
  pricing: {
    eyebrowText: "Pricing",
    title: "Choose Your Path to Storytelling",
    subtitle:
      "Both plans include full access to the Story Gems platform.\nStart free — upgrade anytime.",
    footerNote: "Secure checkout · 30-day money-back guarantee · No hidden fees",
    plans: [
      {
        badgeText: "SELF-PACED",
        name: "Independent Story Builder (DIY)",
        currency: "USD",
        price: "$277",
        period: "one-time",
        description:
          "Everything you need to start capturing and preserving your family stories on your own schedule.",
        features: [
          "Full website access",
          "24 structured lessons",
          "Story writing tools",
          "Create digital storybooks",
          "Memory prompt library",
          "PDF export",
        ],
        buttonText: "Get Started",
      },
      {
        badgeText: "MOST POPULAR",
        recommendedBadge: "★ RECOMMENDED",
        isRecommended: true,
        name: "Guided Story Completion (DWY)",
        currency: "USD",
        price: "$477",
        period: "one-time",
        description:
          "Our complete, supported program with live coaching to take you all the way to a finished storybook.",
        features: [
          "Everything in Independent",
          "56 comprehensive lessons",
          "12 weekly live sessions",
          "Personal story coach",
          "Community access",
          "Printed book option",
        ],
        buttonText: "Start Guided Program",
      },
    ],
  },
  guarantee: {
    eyebrowText: "Our Promise To You",
    title: "100% Can't Lose Guarantee",
    description:
      "If after 30 days you feel the program isn't helping you capture and preserve your family stories, we'll provide a full refund — no questions asked.",
    buttonText: "Learn More",
    pills: ["30-Day Guarantee", "No Questions Asked", "Instant Refund"],
  },
  finalCta: {
    eyebrowText: "Begin Today",
    title: "Start With One Memory",
    subtitle:
      "Most meaningful stories begin with a single moment. Try the process today — it's completely free to start.",
    backgroundImageUrl: "",
    buttonText: "Download the FREE Starter Kit",
    microcopy: '"No Credit Card Required" - No Payment Required',
  },
};

const isDataUri = (value) => typeof value === "string" && value.trim().startsWith("data:");

async function uploadIfDataUri(value, folder) {
  if (!isDataUri(value)) return value;
  const res = await cloudinary.uploader.upload(value, { folder });
  return res?.secure_url || value;
}

async function normalizeImages(content) {
  if (!content || typeof content !== "object") return content;

  // shallow clone, then mutate nested objects as needed
  const next = JSON.parse(JSON.stringify(content));

  // navbar
  if (next?.navbar) {
    next.navbar.logoUrl = await uploadIfDataUri(next.navbar.logoUrl, "landing_page/navbar");
  }

  // hero
  if (next?.hero) {
    next.hero.backgroundImageUrl = await uploadIfDataUri(next.hero.backgroundImageUrl, "landing_page/hero");
  }

  // startWithOneMemory
  if (next?.startWithOneMemory) {
    next.startWithOneMemory.imageUrl = await uploadIfDataUri(next.startWithOneMemory.imageUrl, "landing_page/start_with_one_memory");
  }

  // watchMemory
  if (next?.watchMemory) {
    next.watchMemory.thumbnailUrl = await uploadIfDataUri(next.watchMemory.thumbnailUrl, "landing_page/watch_memory");
  }

  // features
  if (next?.features?.cards && Array.isArray(next.features.cards)) {
    for (const card of next.features.cards) {
      if (!card || typeof card !== "object") continue;
      card.imageUrl = await uploadIfDataUri(card.imageUrl, "landing_page/features");
      // allow iconUrl too if you later add it
      if (card.iconUrl) {
        card.iconUrl = await uploadIfDataUri(card.iconUrl, "landing_page/features/icons");
      }
    }
  }

  // learning
  if (next?.learning) {
    next.learning.imageUrl = await uploadIfDataUri(next.learning.imageUrl, "landing_page/learning");
  }

  // support
  if (next?.support?.cards && Array.isArray(next.support.cards)) {
    for (const card of next.support.cards) {
      if (!card || typeof card !== "object") continue;
      if (card.imageUrl) card.imageUrl = await uploadIfDataUri(card.imageUrl, "landing_page/support");
    }
  }

  // finalCta
  if (next?.finalCta) {
    next.finalCta.backgroundImageUrl = await uploadIfDataUri(next.finalCta.backgroundImageUrl, "landing_page/final_cta");
  }

  return next;
}

async function getOrCreateDoc() {
  let doc = await LandingPage.findOne({ key: "default" });
  if (!doc) {
    doc = await LandingPage.create({ key: "default", content: DEFAULT_CONTENT });
  } else {
    const merged = deepMerge(DEFAULT_CONTENT, doc.content || {});
    // persist if anything was missing
    if (!doc.content || Object.keys(doc.content).length === 0 || JSON.stringify(merged) !== JSON.stringify(doc.content)) {
      doc.content = merged;
      await doc.save();
    }
  }
  return doc;
}

// GET /admin/landing-page
const getLandingPage = async (req, res) => {
  try {
    const doc = await getOrCreateDoc();
    return res.status(200).json({
      message: "Landing page fetched successfully",
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

// PUT /admin/landing-page
const updateLandingPage = async (req, res) => {
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
    const normalized = await normalizeImages(merged);

    const doc = await LandingPage.findOneAndUpdate(
      { key: "default" },
      { $set: { content: normalized } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Landing page updated successfully",
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

// POST /admin/landing-page/upload-image
const uploadLandingPageImage = async (req, res) => {
  try {
    const { image, folder } = req.body || {};
    if (typeof image !== "string" || image.trim().length === 0) {
      return res.status(400).json({ message: "image is required", response: null, error: "Missing image" });
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: typeof folder === "string" && folder.trim() ? folder.trim() : "landing_page",
    });

    return res.status(200).json({ message: "Image uploaded", response: { url: uploadRes.secure_url }, error: null });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", response: null, error: error.message });
  }
};

module.exports = {
  DEFAULT_CONTENT,
  getLandingPage,
  updateLandingPage,
  uploadLandingPageImage,
};
