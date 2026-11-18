const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });

  res.status(201).json({
    success: true,
    message: "Pengguna baru berhasil didaftarkan",
    data: result
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: "Login berhasil, selamat datang kembali",
    data: result
  });
});

const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh({ refreshToken });

  res.status(200).json({
    success: true,
    message: "Token akses baru berhasil diterbitkan",
    data: result
  });
});

module.exports = {
  register,
  login,
  refresh
};
