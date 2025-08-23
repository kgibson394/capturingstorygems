const blockPublicUsers = (req, res, next) => {
  if (req.decoded?.isPublic) {
    return res.status(403).json({
      message: "This action is not allowed to this users",
      response: null,
      error: "This action is not allowed to this users",
    });
  }
  next();
};

module.exports = {
  blockPublicUsers,
};
