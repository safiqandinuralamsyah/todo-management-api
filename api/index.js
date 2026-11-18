require("dotenv").config();
const app = require("../src/app");
const connectDB = require("../src/config/db");

module.exports = async (req, res) => {
  // Cegah error koneksi DB memblokir rute statis, healthcheck, dan dokumentasi Swagger
  const url = req.url || "";
  const isDocsOrHealth =
    url.startsWith("/api-docs") ||
    url === "/" ||
    url === "/favicon.ico" ||
    url === "/api-docs.json";

  if (!isDocsOrHealth) {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: "Konfigurasi server belum lengkap: MONGODB_URI belum disetel pada Environment Variables di Dashboard Vercel."
      });
    }

    try {
      await connectDB();
    } catch (err) {
      console.error("Gagal menghubungkan MongoDB pada serverless function:", err.message);
      return res.status(500).json({
        success: false,
        message: `Koneksi database MongoDB gagal: ${err.message}. Pastikan IP Whitelist (0.0.0.0/0) sudah diizinkan di MongoDB Atlas.`
      });
    }
  }

  return app(req, res);
};
