const express = require("express");
const router = express.Router();
const statsController = require("../controllers/stats.controller");
const { checkApiKey } = require("../middlewares/apiKey.middleware");
const { statsLimiter } = require("../middlewares/rateLimiter.middleware");

// Proteksi machine-to-machine menggunakan x-api-key dan rate limiter
router.use(checkApiKey);
router.use(statsLimiter);

/**
 * @openapi
 * /stats/summary:
 *   get:
 *     tags:
 *       - Stats (Machine-to-Machine)
 *     summary: Mengambil ringkasan statistik sistem menggunakan API Key
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Ringkasan statistik berhasil diambil
 *       401:
 *         description: API Key tidak valid atau kosong
 *       429:
 *         description: Rate limit terlampaui
 */
router.get("/summary", statsController.getSummary);

/**
 * @openapi
 * /stats/activity-logs:
 *   get:
 *     tags:
 *       - Stats (Machine-to-Machine)
 *     summary: Mengambil daftar log aktivitas pemantauan eksternal
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Log aktivitas eksternal berhasil diambil
 *       401:
 *         description: API Key tidak valid atau kosong
 */
router.get("/activity-logs", statsController.getActivityLogs);

module.exports = router;
