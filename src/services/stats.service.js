const Todo = require("../models/todo.model");
const Category = require("../models/category.model");
const ActivityLog = require("../models/activityLog.model");

const getStatsSummary = async () => {
  const [
    totalTodos,
    completedTodos,
    pendingTodos,
    totalCategories,
    todosPerCategory
  ] = await Promise.all([
    Todo.countDocuments({ archived: false }),
    Todo.countDocuments({ completed: true, archived: false }),
    Todo.countDocuments({ completed: false, archived: false }),
    Category.countDocuments({ archived: false }),
    Todo.aggregate([
      { $match: { archived: false } },
      {
        $group: {
          _id: "$category",
          todoCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$completed", false] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails"
        }
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          _id: 1,
          categoryName: "$categoryDetails.name",
          categoryColor: "$categoryDetails.color",
          todoCount: 1,
          completedCount: 1,
          pendingCount: 1
        }
      },
      { $sort: { todoCount: -1 } }
    ])
  ]);

  return {
    overview: {
      totalTodos,
      completedTodos,
      pendingTodos,
      totalCategories,
      completionRate:
        totalTodos > 0 ? `${((completedTodos / totalTodos) * 100).toFixed(1)}%` : "0%"
    },
    todosPerCategory
  };
};

const getExternalActivityLogs = async (limit = 20) => {
  const cappedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const logs = await ActivityLog.find({ archived: false })
    .sort({ created_at: -1 })
    .limit(cappedLimit)
    .populate("userId", "name email role")
    .populate("todoId", "title priority completed")
    .populate("categoryId", "name color")
    .lean();

  return logs;
};

module.exports = {
  getStatsSummary,
  getExternalActivityLogs
};
