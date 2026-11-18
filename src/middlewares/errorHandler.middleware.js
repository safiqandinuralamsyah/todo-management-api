const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  let statusCode = err.statusCode || 500;
  let message = err.message || "Terjadi kesalahan internal pada server";
  let errors = err.errors || undefined;

  // 1. Mongoose CastError (Invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Format identifier tidak valid untuk kolom: ${err.path}`;
  }

  // 2. Mongoose Duplicate Key (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "data";
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} yang dimasukkan sudah terdaftar di sistem`;
  }

  // 3. Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = "Validasi data skema gagal";
    errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
  }

  // 4. JWT Error
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token autentikasi tidak valid atau telah dimodifikasi";
  }

  // 5. JWT Expired Error
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Sesi token autentikasi telah kedaluwarsa, silakan perbarui token";
  }

  // 6. Express-rate-limit 429
  if (statusCode === 429) {
    message = err.message || "Terlalu banyak permintaan dari alamat IP ini, silakan coba lagi beberapa saat";
  }

  const responseBody = {
    success: false,
    message
  };

  if (errors && errors.length > 0) {
    responseBody.errors = errors;
  }

  if (process.env.NODE_ENV === "development" && !err.isOperational) {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
