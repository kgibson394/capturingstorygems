const Subscription = require("../models/subscription.js");

const TRIAL_DAYS = 10;

function calcTrialEndDate(startDate) {
  const end = new Date(startDate);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}

async function ensureTrialInitialized(userDoc) {
  if (!userDoc || userDoc.isPublic) return userDoc;

  // Backfill for older accounts (one-time), but never reset if already present.
  if (userDoc.trialUsed || userDoc.trialStartDate || userDoc.trialEndDate) {
    return userDoc;
  }

  const start = userDoc.createdAt || new Date();
  userDoc.trialUsed = true;
  userDoc.trialStartDate = start;
  userDoc.trialEndDate = calcTrialEndDate(start);
  await userDoc.save();
  return userDoc;
}

async function getActivePaidSubscription(userId) {
  return Subscription.findOne({
    userId,
    expiryDate: { $gt: new Date() },
    status: "paid",
  })
    .select("storiesCreated storiesAllowed")
    .lean();
}

async function evaluateStoryAccess(userDoc) {
  if (!userDoc || userDoc.isPublic) {
    return {
      ok: true,
      subscription: null,
      trialActive: false,
      hasActiveSubscription: false,
    };
  }

  await ensureTrialInitialized(userDoc);

  const now = new Date();
  const trialActive = Boolean(userDoc.trialEndDate && userDoc.trialEndDate > now);
  const subscription = await getActivePaidSubscription(userDoc._id);
  const hasActiveSubscription = Boolean(subscription);

  if (!subscription && !trialActive) {
    return {
      ok: false,
      subscription: null,
      trialActive: false,
      hasActiveSubscription: false,
      message:
        "Your free trial has ended. Please select a plan to continue creating stories",
      error: "No active subscription and trial expired",
    };
  }

  if (subscription && subscription.storiesCreated >= subscription.storiesAllowed) {
    return {
      ok: false,
      subscription,
      trialActive,
      hasActiveSubscription: true,
      message: "You have reached your story limit for this subscription plan",
      error: "You have reached your story limit for this subscription plan",
      statusCode: 403,
    };
  }

  return {
    ok: true,
    subscription,
    trialActive,
    hasActiveSubscription,
  };
}

async function assertCanUseStoriesOrRespond(res, userDoc) {
  const access = await evaluateStoryAccess(userDoc);
  if (access.ok) {
    return {
      ok: true,
      subscription: access.subscription,
      trialActive: access.trialActive,
    };
  }

  res.status(access.statusCode || 402).json({
    message: access.message,
    response: null,
    error: access.error,
  });
  return { ok: false, subscription: access.subscription, trialActive: access.trialActive };
}

module.exports = {
  TRIAL_DAYS,
  calcTrialEndDate,
  ensureTrialInitialized,
  getActivePaidSubscription,
  evaluateStoryAccess,
  assertCanUseStoriesOrRespond,
};
