const { body } = require("express-validator");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama lengkap wajib diisi")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama harus memiliki panjang antara 2 hingga 100 karakter"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format alamat email tidak valid")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Kata sandi wajib diisi")
    .isLength({ min: 6 })
    .withMessage("Kata sandi harus terdiri dari minimal 6 karakter"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role hanya diperbolehkan 'user' atau 'admin'")
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email wajib diisi")
    .isEmail()
    .withMessage("Format alamat email tidak valid")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Kata sandi wajib diisi")
];

const refreshValidator = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token wajib disertakan pada request body")
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshValidator
};
