const AppError = require("../utils/AppError");

const checkApiKey = (req, res, next) => {
  const providedApiKey = req.headers["x-api-key"];
  const validApiKey = process.env.EXTERNAL_API_KEY;

  if (!providedApiKey) {
    return next(
      new AppError(
        "Akses ditolak: Header 'x-api-key' wajib disertakan untuk endpoint machine-to-machine",
        401
      )
    );
  }

  if (!validApiKey || providedApiKey !== validApiKey) {
    return next(
      new AppError("Akses ditolak: Kunci API ('x-api-key') yang diberikan tidak valid", 401)
    );
  }

  next();
};

module.exports = { checkApiKey };
