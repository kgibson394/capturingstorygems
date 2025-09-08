const Group = require("../../models/group");
const User = require("../../models/user");

const getGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    const groupsCount = await Group.countDocuments();
    const totalPages = Math.ceil(groupsCount / pageSize);

    const groups = await Group.find({})
      .populate("users", "email")
      .skip(offset)
      .limit(pageSize)
      .lean({ virtuals: true });

    return res.status(200).json({
      message: "Groups fetched successfully",
      response: {
        data: {
          groups,
          total: groupsCount,
          page,
          pageSize,
          totalPages,
        },
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

const getUsers = async (req, res) => {
  try {
    const users = await User.find({isPublic: false}).select("_id email").lean();

    return res.status(200).json({
      message: "Users fetched successfully",
      response: {
        data: {
          users,
        },
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

const createGroup = async (req, res) => {
  try {
    const { groupTag, name } = req.body;

    const existingGroup = await Group.findOne({
      groupTag: new RegExp(`^${groupTag}$`, "i"),
    });

    if (existingGroup) {
      return res.status(409).json({
        message: "Group with the same tag already exists",
        response: null,
        error: "Group with the same tag already exists",
      });
    }

    await Group.create({
      groupTag,
      name,
    });

    return res.status(201).json({
      message: "Group created successfully",
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

const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { groupTag, name } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        response: null,
        error: "Group not found",
      });
    }

    if (groupTag && groupTag.trim() !== group.groupTag) {
      const existing = await Group.findOne({
        groupTag: new RegExp(`^${groupTag}$`, "i"),
        _id: { $ne: groupId },
      });

      if (existing) {
        return res.status(409).json({
          message: "Group with the same tag already exists",
          response: null,
          error: "Group with the same tag already exists",
        });
      }
    }

    if (groupTag !== undefined) group.groupTag = groupTag;
    if (name !== undefined) group.name = name;
    await group.save();

    return res.status(200).json({
      message: "Group updated successfully",
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

const addUsersToGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userIds } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        response: null,
        error: "Group not found",
      });
    }

    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(404).json({
        message: "Some users not found",
        response: null,
        error: "Some users not found",
      });
    }

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { groupId: groupId } }
    );

    const newUserIds = userIds.filter(
      (id) => !group.users.map(String).includes(String(id))
    );
    if (newUserIds.length > 0) {
      group.users.push(...newUserIds);
      await group.save();
    }

    return res.status(200).json({
      message: "Users added to group successfully",
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

const removeUserFromGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        response: null,
        error: "Group not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        response: null,
        error: "User not found",
      });
    }

    if (user.groupId?.toString() === groupId.toString()) {
      user.groupId = null;
      await user.save();
    }

    if (group.users.includes(userId)) {
      group.users = group.users.filter(
        (id) => id.toString() !== userId.toString()
      );
      await group.save();
    }

    return res.status(200).json({
      message: "User removed from group successfully",
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

const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        message: "Group not found",
        response: null,
        error: "Group not found",
      });
    }

    await User.updateMany({ groupId: groupId }, { $unset: { groupId: "" } });
    await Group.findByIdAndDelete(groupId);

    return res.status(200).json({
      message: "Group deleted successfully",
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
  getGroups,
  getUsers,
  createGroup,
  addUsersToGroup,
  removeUserFromGroup,
  updateGroup,
  deleteGroup,
};
