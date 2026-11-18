const Todo = require("../models/todo.model");
const Category = require("../models/category.model");
const AppError = require("../utils/AppError");
const { logActivity } = require("./activityLog.service");

const createTodo = async ({
  title,
  description,
  completed,
  priority,
  dueDate,
  category,
  user
}) => {
  const categoryFilter = { _id: category, archived: false };
  if (user.role !== "admin") {
    categoryFilter.owner = user._id;
  }

  const existingCategory = await Category.findOne(categoryFilter);
  if (!existingCategory) {
    throw new AppError("Kategori yang dipilih tidak valid, telah dihapus, atau bukan milik Anda", 404);
  }

  const newTodo = await Todo.create({
    title,
    description: description || "",
    completed: completed !== undefined ? completed : false,
    priority: priority || "medium",
    dueDate: dueDate ? new Date(dueDate) : null,
    category: existingCategory._id,
    owner: user._id,
    created_by: user._id,
    updated_by: user._id,
    archived: false
  });

  await logActivity({
    action: "CREATE_TODO",
    todoId: newTodo._id,
    categoryId: existingCategory._id,
    userId: user._id,
    details: `Membuat tugas baru: "${newTodo.title}"`,
    metadata: {
      title: newTodo.title,
      priority: newTodo.priority,
      category: existingCategory.name
    }
  });

  return newTodo.populate([
    { path: "category", select: "name color" },
    { path: "owner", select: "name email" }
  ]);
};

const getTodos = async ({ user, query }) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { archived: false };

  if (user.role !== "admin") {
    filter.owner = user._id;
  } else if (query.owner) {
    filter.owner = query.owner;
  }

  if (query.completed !== undefined) {
    filter.completed = query.completed === "true";
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.priority) {
    filter.priority = query.priority;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), "i");
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  const sortBy = query.sortBy || "created_at";
  const order = query.order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: order };

  const [todos, totalItems] = await Promise.all([
    Todo.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("category", "name color")
      .populate("owner", "name email")
      .lean(),
    Todo.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    todos,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit
    }
  };
};

const getTodoById = async ({ id, user }) => {
  const filter = { _id: id, archived: false };
  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  const todo = await Todo.findOne(filter)
    .populate("category", "name color")
    .populate("owner", "name email");

  if (!todo) {
    throw new AppError("Tugas tidak ditemukan atau Anda tidak memiliki akses", 404);
  }

  return todo;
};

const updateTodo = async ({ id, updateData, user }) => {
  const filter = { _id: id, archived: false };
  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  const todo = await Todo.findOne(filter);
  if (!todo) {
    throw new AppError("Tugas tidak ditemukan atau Anda tidak memiliki akses untuk memperbarui", 404);
  }

  if (updateData.category) {
    const categoryFilter = { _id: updateData.category, archived: false };
    if (user.role !== "admin") {
      categoryFilter.owner = user._id;
    }
    const categoryExists = await Category.findOne(categoryFilter);
    if (!categoryExists) {
      throw new AppError("Kategori baru tidak ditemukan atau bukan milik Anda", 404);
    }
    todo.category = updateData.category;
  }

  if (updateData.title !== undefined) todo.title = updateData.title;
  if (updateData.description !== undefined) todo.description = updateData.description;
  if (updateData.completed !== undefined) todo.completed = updateData.completed;
  if (updateData.priority !== undefined) todo.priority = updateData.priority;
  if (updateData.dueDate !== undefined) {
    todo.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
  }

  todo.updated_by = user._id;
  await todo.save();

  await logActivity({
    action: "UPDATE_TODO",
    todoId: todo._id,
    categoryId: todo.category,
    userId: user._id,
    details: `Memperbarui tugas: "${todo.title}"`,
    metadata: updateData
  });

  return todo.populate([
    { path: "category", select: "name color" },
    { path: "owner", select: "name email" }
  ]);
};

const deleteTodo = async ({ id, user }) => {
  const filter = { _id: id, archived: false };
  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  const todo = await Todo.findOne(filter);
  if (!todo) {
    throw new AppError("Tugas tidak ditemukan atau Anda tidak memiliki akses untuk menghapus", 404);
  }

  todo.archived = true;
  todo.updated_by = user._id;
  await todo.save();

  await logActivity({
    action: "DELETE_TODO",
    todoId: todo._id,
    categoryId: todo.category,
    userId: user._id,
    details: `Menghapus (soft delete) tugas: "${todo.title}"`,
    metadata: { id: todo._id, title: todo.title }
  });

  return todo;
};

const adminArchiveAllTodos = async ({ user }) => {
  const result = await Todo.updateMany(
    { archived: false },
    { archived: true, updated_by: user._id }
  );

  await logActivity({
    action: "DELETE_TODO",
    userId: user._id,
    details: `Admin mengarsipkan seluruh todo aktif (${result.modifiedCount} dokumen)`,
    metadata: { modifiedCount: result.modifiedCount }
  });

  return {
    archivedCount: result.modifiedCount
  };
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  adminArchiveAllTodos
};
