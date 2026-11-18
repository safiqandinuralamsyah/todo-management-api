const Category = require("../models/category.model");
const Todo = require("../models/todo.model");
const AppError = require("../utils/AppError");
const { logActivity } = require("./activityLog.service");

const createCategory = async ({ name, description, color, user }) => {
  const category = await Category.create({
    name,
    description: description || "",
    color: color || "#3B82F6",
    owner: user._id,
    created_by: user._id,
    updated_by: user._id,
    archived: false
  });

  await logActivity({
    action: "CREATE_CATEGORY",
    categoryId: category._id,
    userId: user._id,
    details: `Membuat kategori baru: "${category.name}"`,
    metadata: { name: category.name, color: category.color }
  });

  return category;
};

const getCategories = async ({ user }) => {
  const filter = { archived: false };

  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  const categories = await Category.find(filter)
    .populate("owner", "name email")
    .sort({ created_at: -1 });

  return categories;
};

const getCategoryById = async ({ id, user }) => {
  const filter = { _id: id, archived: false };
  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  const category = await Category.findOne(filter).populate("owner", "name email");
  if (!category) {
    throw new AppError("Kategori tidak ditemukan atau Anda tidak memiliki akses", 404);
  }

  const todoFilter = { category: id, archived: false };
  if (user.role !== "admin") {
    todoFilter.owner = user._id;
  }

  const todos = await Todo.find(todoFilter).sort({ created_at: -1 });

  const result = category.toObject();
  result.todos = todos;

  return result;
};

const updateCategory = async ({ id, updateData, user }) => {
  const filter = { _id: id, archived: false };
  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  const category = await Category.findOne(filter);
  if (!category) {
    throw new AppError("Kategori tidak ditemukan atau Anda tidak memiliki akses untuk memperbarui", 404);
  }

  if (updateData.name !== undefined) category.name = updateData.name;
  if (updateData.description !== undefined) category.description = updateData.description;
  if (updateData.color !== undefined) category.color = updateData.color;

  category.updated_by = user._id;
  await category.save();

  await logActivity({
    action: "UPDATE_CATEGORY",
    categoryId: category._id,
    userId: user._id,
    details: `Memperbarui kategori: "${category.name}"`,
    metadata: updateData
  });

  return category;
};

const deleteCategory = async ({ id, user }) => {
  const filter = { _id: id, archived: false };
  if (user.role !== "admin") {
    filter.owner = user._id;
  }

  const category = await Category.findOne(filter);
  if (!category) {
    throw new AppError("Kategori tidak ditemukan atau Anda tidak memiliki akses untuk menghapus", 404);
  }

  category.archived = true;
  category.updated_by = user._id;
  await category.save();

  // Cascade soft delete to associated todos
  await Todo.updateMany(
    { category: id, archived: false },
    { archived: true, updated_by: user._id }
  );

  await logActivity({
    action: "DELETE_CATEGORY",
    categoryId: category._id,
    userId: user._id,
    details: `Menghapus (soft delete) kategori: "${category.name}" beserta todo di dalamnya`,
    metadata: { id: category._id, name: category.name }
  });

  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
