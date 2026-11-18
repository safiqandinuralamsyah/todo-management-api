const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const AppError = require("../utils/AppError");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
    }
  );
};

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Alamat email tersebut sudah terdaftar di sistem", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "user"
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.created_by = user._id;
  user.updated_by = user._id;
  await user.save({ validateBeforeSave: false });

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return {
    user: sanitizedUser,
    accessToken,
    refreshToken
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email, archived: false }).select("+password +refreshToken");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Kredensial login tidak valid, periksa email dan kata sandi Anda", 401);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.updated_by = user._id;
  await user.save({ validateBeforeSave: false });

  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;
  delete sanitizedUser.refreshToken;

  return {
    user: sanitizedUser,
    accessToken,
    refreshToken
  };
};

const refresh = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new AppError("Refresh token tidak boleh kosong", 400);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Refresh token tidak valid atau telah kedaluwarsa", 401);
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.archived) {
    throw new AppError("Pengguna pemilik refresh token tidak ditemukan atau telah dinonaktifkan", 401);
  }

  if (user.refreshToken !== refreshToken) {
    throw new AppError("Refresh token tidak cocok atau telah dicabut, silakan login kembali", 401);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  user.updated_by = user._id;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  register,
  login,
  refresh
};
