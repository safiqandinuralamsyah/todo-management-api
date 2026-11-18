const AppError = require("../utils/AppError");

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Rute ${req.method} ${req.originalUrl} tidak ditemukan pada server`, 404));
};

module.exports = notFoundHandler;
