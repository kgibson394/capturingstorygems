const bcrypt = require("bcrypt");
const User = require("../../models/user");
const Story = require("../../models/story");
const { configurations } = require("../../configs/config.js");

const salt = configurations.salt;

const createPublicUser = async (req, res) => {
  try {
    const { email, password, passwordExpiryDate, storyExpiryDate } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isExpired =
        existingUser.emailVerified === false &&
        existingUser.emailVerificationCodeExpiry < new Date();

      if (!isExpired) {
        return res.status(409).json({
          message: "User already exists",
          response: null,
          error: "User already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    if (!existingUser) {
      const newUser = new User({
        email,
        password: hashedPassword,
        emailVerified: true,
        isPublic: true,
        storyExpiryDate,
        passwordExpiryDate,
      });
      await newUser.save();
    } else {
      existingUser.isPublic = true;
      existingUser.emailVerified = true;
      existingUser.password = hashedPassword;
      existingUser.emailVerificationCode = null;
      existingUser.emailVerificationCodeExpiry = null;
      existingUser.storyExpiryDate = storyExpiryDate;
      existingUser.passwordExpiryDate = passwordExpiryDate;
      await existingUser.save();
    }

    return res.status(201).json({
      message: "Public user created successfully",
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

const getPublicUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;

    const query = {
      isPublic: true,
    };

    const publicUsersCount = await User.countDocuments(query);
    const totalPages = Math.ceil(publicUsersCount / pageSize);

    const publicUsers = await User.find(query)
      .skip(offset)
      .limit(pageSize)
      .select("email password passwordExpiryDate storyExpiryDate")
      .lean({ virtuals: true });

    return res.status(200).json({
      message: "Users returned successfully",
      response: {
        data: {
          publicUsers,
          total: publicUsersCount,
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

const updatePublicUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password, passwordExpiryDate, storyExpiryDate } = req.body;

    const user = await User.findById(userId).select("password passwordExpiryDate storyExpiryDate");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        response: null,
        error: "User not found",
      });
    }

    if(password){
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (passwordExpiryDate) user.passwordExpiryDate = passwordExpiryDate;
    if (storyExpiryDate) user.storyExpiryDate = storyExpiryDate;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
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
  createPublicUser,
  getPublicUsers,
  updatePublicUser,
  deleteUser,
};
