const User = require("../../models/user.js");
const Story = require("../../models/story.js");
const Plan = require("../../models/plan.js");
const Group = require("../../models/group.js");
const Payment = require("../../models/payment.js");
const Subscription = require("../../models/subscription.js");

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    const sortOrder = req.query.sortOrder === "old" ? 1 : -1;
    const search = req.query.search || "";

    const query = {
      isPublic: { $ne: true },
    };

    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const usersCount = await User.countDocuments(query);
    const totalPages = Math.ceil(usersCount / pageSize);

    const users = await User.aggregate([
      { $match: query },
      { $sort: { createdAt: sortOrder } },
      { $skip: offset },
      { $limit: pageSize },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "userId",
          as: "subscription",
        },
      },
      { $unwind: { path: "$subscription", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "plans",
          localField: "subscription.planId",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "stories",
          localField: "_id",
          foreignField: "userId",
          as: "stories",
        },
      },
      {
        $addFields: {
          storiesCount: { $size: "$stories" },
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          emailVerified: 1,
          status: 1,
          planName: "$plan.name",
          startDate: "$subscription.startDate",
          expiryDate: "$subscription.expiryDate",
          storiesCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Users returned successfully",
      response: {
        data: {
          users,
          total: usersCount,
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

const getDashboardData = async (req, res) => {
  try {
    const query = {
      isPublic: { $ne: true },
    };

    const usersCount = await User.countDocuments(query);
    const storiesCount = await Story.countDocuments();
    const subscriptionCount = await Subscription.countDocuments();

    const usersWithPlanInfo = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({
        path: "subscription",
        select: "planId expiryDate",
        populate: {
          path: "planId",
          model: "Plan",
          select: "name -_id",
        },
      })
      .lean({ virtuals: true });

    const users = usersWithPlanInfo.map((u) => {
      const { subscription, ...userFields } = u;
      return {
        email: userFields?.email || null,
        status: userFields?.status || null,
        planName: subscription?.planId?.name || null,
        expiryDate: subscription?.expiryDate || null,
      };
    });

    const plans = await Plan.find({}).sort({ createdAt: -1 }).limit(3);

    return res.status(200).json({
      message: "Dashboard data returned successfully",
      response: {
        data: {
          users,
          plans,
          totalUsers: usersCount,
          totalStories: storiesCount,
          totalActivePlans: subscriptionCount,
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

const updateStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const user = await User.findById(userId)
      .select("status emailVerified")
      .exec();
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        response: null,
        error: "User not found",
      });
    }

    let message;

    if (status === "un-block" && user.status !== "blocked") {
      return res.status(200).json({
        message: "User is not currently blocked, no action taken",
        response: null,
        error: null,
      });
    } else if (status === "block" && user.status === "blocked") {
      return res.status(200).json({
        message: "User is already blocked",
        response: null,
        error: null,
      });
    } else if (status === "block") {
      user.status = "blocked";
      await user.save();
      message = "User has been blocked successfully";
    } else {
      user.status = user.emailVerified ? "active" : "pending";
      await user.save();
      message = `User has been un‐blocked and set to "${user.status}"`;
    }

    return res.status(200).json({
      message,
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

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        response: null,
        error: "User not found",
      });
    }

    await Group.updateMany({ users: userId }, { $pull: { users: userId } });
    await Promise.all([
      Payment.deleteMany({ userId: userId }),
      Subscription.deleteMany({ userId }),
      Story.deleteMany({ userId }),
    ]);

    return res.status(200).json({
      message: "User deleted successfully",
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
  getUsers,
  getDashboardData,
  updateStatus,
  deleteUser,
};
