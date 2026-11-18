const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  registerValidator,
  loginValidator,
  refreshValidator
} = require("../validators/auth.validator");
const validate = require("../middlewares/validate.middleware");
const { authLimiter } = require("../middlewares/rateLimiter.middleware");

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrasi pengguna baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Budi Santoso
 *               email:
 *                 type: string
 *                 example: budi@todoapp.id
 *               password:
 *                 type: string
 *                 example: User123!
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: user
 *     responses:
 *       201:
 *         description: Pengguna berhasil didaftarkan
 *       409:
 *         description: Email sudah terdaftar
 *       422:
 *         description: Validasi input gagal
 */
router.post("/register", authLimiter, registerValidator, validate, authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login pengguna untuk memperoleh Access & Refresh Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: budi@todoapp.id
 *               password:
 *                 type: string
 *                 example: User123!
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Kredensial tidak valid
 *       422:
 *         description: Validasi input gagal
 */
router.post("/login", authLimiter, loginValidator, validate, authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Memperbarui Access Token menggunakan Refresh Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *       401:
 *         description: Refresh token tidak valid atau telah kedaluwarsa
 */
router.post("/refresh", authLimiter, refreshValidator, validate, authController.refresh);

module.exports = router;
