const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const Admin = require("../models/admin.js");

const jwtSecret = process.env.JWT_SECRET;

const verifyUserToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (token) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: err,
        });
      }
      const email = decoded?.user?.email;
      const user = await User.findOne({ email }).select("email emailVerified isPublic");
      if (!user) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: "Invalid token or expired",
        });
      }
      if (!user.emailVerified) {
        return res.status(400).json({
          message: "Email not verified",
          response: null,
          error: "Email not verified",
        });
      }
      if (user.status === "blocked") {
        return res.status(400).json({
          message:
            "Your account has been blocked. Please contact administration",
          data: null,
          error: "Account blocked",
        });
      }
      req.decoded = user;
      next();
    });
  } else {
    return res.status(401).json({
      message: "Access denied, authentication token missing",
      response: null,
      error: "Access denied, authentication token missing",
    });
  }
};

const verifyAdminToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (token) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: "Invalid token or expired",
          response: null,
          error: err,
        });
      }
      const email = decoded?.admin?.email;
      const admin = await Admin.findOne({ email })
      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
          response: null,
          error: "Admin not found",
        });
      }
      req.decoded = admin;
      next();
    });
  } else {
    return res.status(401).json({
      message: "Access denied, authentication token missing",
      response: null,
      error: "Access denied, authentication token missing",
    });
  }
};

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (token) {
    token = token.replace("Bearer ", "");
    
    jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err) {
        req.decoded = {};
        return next();
      }
      const email = decoded?.user?.email;
      const user = await User.findOne({ email }).select("email emailVerified isPublic");
      if (!user) {
        req.decoded = {};
        return next();
      }
      if (!user?.emailVerified) {
        return res.status(400).json({
          message: "Email not verified",
          response: null,
          error: "Email not verified",
        });
      }
      if (user.status === "blocked") {
        req.decoded = {};
        return next();
      }
      req.decoded = user;
      return next();
    });
  } else {
    req.decoded = {};
    return next();
  }
};

module.exports = {
  verifyUserToken,
  verifyAdminToken,
  verifyToken,
};
