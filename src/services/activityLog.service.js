const ActivityLog = require("../models/activityLog.model");

const logActivity = async ({
  action,
  todoId = null,
  categoryId = null,
  userId,
  details,
  metadata = {}
}) => {
  return ActivityLog.create({
    action,
    todoId,
    categoryId,
    userId,
    details,
    metadata,
    created_by: userId,
    updated_by: userId,
    archived: false
  });
};

const getActivityLogs = async ({ user, query }) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = { archived: false };

  if (user.role !== "admin") {
    filter.userId = user._id;
  }

  if (query.action) {
    filter.action = query.action;
  }

  const [logs, totalItems] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email role")
      .populate("todoId", "title priority completed")
      .populate("categoryId", "name color")
      .lean(),
    ActivityLog.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    logs,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    }
  };
};

module.exports = {
  logActivity,
  getActivityLogs
};
