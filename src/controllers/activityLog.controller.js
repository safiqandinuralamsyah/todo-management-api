const activityLogService = require("../services/activityLog.service");
const catchAsync = require("../utils/catchAsync");

const getActivityLogs = catchAsync(async (req, res) => {
  const result = await activityLogService.getActivityLogs({
    user: req.user,
    query: req.query
  });

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil riwayat log aktivitas",
    data: result.logs,
    pagination: result.pagination
  });
});

module.exports = {
  getActivityLogs
};
