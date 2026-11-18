const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("Akses ditolak: Anda belum login atau token autentikasi tidak disertakan", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("Pengguna pemilik token ini sudah tidak terdaftar di sistem", 401)
    );
  }

  if (currentUser.archived) {
    return next(
      new AppError("Akun pengguna ini telah dinonaktifkan atau diarsipkan", 401)
    );
  }

  req.user = currentUser;
  next();
});

module.exports = { protect };
