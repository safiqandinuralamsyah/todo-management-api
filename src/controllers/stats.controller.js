const statsService = require("../services/stats.service");
const catchAsync = require("../utils/catchAsync");

const getSummary = catchAsync(async (req, res) => {
  const summary = await statsService.getStatsSummary();

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil ringkasan statistik sistem",
    data: summary
  });
});

const getActivityLogs = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const logs = await statsService.getExternalActivityLogs(limit);

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil log aktivitas pemantauan eksternal",
    data: logs
  });
});

module.exports = {
  getSummary,
  getActivityLogs
};
