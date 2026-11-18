const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan dari IP ini, silakan coba kembali setelah 15 menit"
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Maksimal 20 percobaan login/register dalam 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan autentikasi dari IP ini, silakan coba lagi setelah 15 menit"
  }
});

const statsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60, // Maksimal 60 request per 5 menit untuk endpoint stats M2M
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan API Key statistik, batas rate limit terlampaui"
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  statsLimiter
};
