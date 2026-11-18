const AppError = require("../utils/AppError");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Akses terlarang: Anda tidak memiliki izin hak akses untuk melakukan tindakan ini",
          403
        )
      );
    }
    next();
  };
};

module.exports = restrictTo;
