const Plan = require("../../models/plan");

const getPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    const plansCount = await Plan.countDocuments();
    const totalPages = Math.ceil(plansCount / pageSize);

    const plans = await Plan.find({})
      .skip(offset)
      .limit(pageSize)
      .lean({ virtuals: true });

    return res.status(200).json({
      message: "Plans returned successfully",
      response: {
        data: {
          plans,
          total: plansCount,
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

const createPlan = async (req, res) => {
  try {
    const { name, type, price, billingCycle, allowedStories, features, featured } = req.body;

    const existingPlan = await Plan.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existingPlan) {
      return res.status(409).json({
        message: "Plan with the same name already exists",
        response: null,
        error: "Plan with the same name already exists",
      });
    }

    await Plan.create({
      name,
      type,
      price,
      billingCycle,
      allowedStories,
      features,
      featured: featured || false,
    });

    return res.status(201).json({
      message: "Plan created successfully",
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

const getPlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
        response: null,
        error: "Plan not found",
      });
    }

    return res.status(200).json({
      message: "Plan returned successfully",
      response: {
        data: plan,
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

const editPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { name, type, price, billingCycle, allowedStories, features, featured } = req.body;

    const existingPlan = await Plan.findOne({
      _id: { $ne: planId },
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existingPlan) {
      return res.status(409).json({
        message: "Another plan with the same name already exists",
        response: null,
        error: "Another plan with the same name already exists",
      });
    }

    const updatedPlan = await Plan.findByIdAndUpdate(
      planId,
      {
        name,
        type,
        price,
        billingCycle,
        allowedStories,
        features,
        featured: featured || false,
      },
      { new: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({
        message: "Plan not found",
        response: null,
        error: "Plan not found",
      });
    }

    return res.status(200).json({
      message: "Plan updated successfully",
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

const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
        response: null,
        error: "Plan not found",
      });
    }

    await Plan.findByIdAndDelete(planId);

    return res.status(200).json({
      message: "Plan deleted successfully",
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
  getPlans,
  createPlan,
  getPlan,
  editPlan,
  deletePlan,
};
