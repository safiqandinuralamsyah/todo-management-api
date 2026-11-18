const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activityLog.controller");
const { protect } = require("../middlewares/auth.middleware");

// Proteksi dengan JWT
router.use(protect);

/**
 * @openapi
 * /activity-logs:
 *   get:
 *     tags:
 *       - Activity Logs
 *     summary: Mengambil riwayat log aktivitas pengguna (admin melihat semua, user melihat miliknya)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE_TODO, UPDATE_TODO, DELETE_TODO, CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY]
 *     responses:
 *       200:
 *         description: Riwayat aktivitas berhasil diambil
 */
router.get("/", activityLogController.getActivityLogs);

module.exports = router;
