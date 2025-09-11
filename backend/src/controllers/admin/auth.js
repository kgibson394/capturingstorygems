const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { configurations } = require("../../configs/config.js");
const Admin = require("../../models/admin.js");

const salt = configurations.salt;
const jwtSecret = configurations.jwtSecret;

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        response: null,
        error: "Admin not found",
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
        response: null,
        error: "Invalid credentials",
      });
    }

    const token = jwt.sign({ admin: { email } }, jwtSecret, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      message: "You've successfully logged in!",
      response: {
        token,
        data: {
          email,
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

const updatePassword = async (req, res) => {
  try {
    const { id } = req.decoded;
    const { currentPassword, newPassword } = req.body;

    const user = await Admin.findById(id).select("password");
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: "Current password does not match",
        response: null,
        error: "Current password does not match",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await Admin.findByIdAndUpdate(id, { password: hashedPassword });

    return res.status(200).json({
      message: "Password updated successfully",
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
  loginAdmin,
  updatePassword,
};
