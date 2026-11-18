const categoryService = require("../services/category.service");
const catchAsync = require("../utils/catchAsync");

const createCategory = catchAsync(async (req, res) => {
  const { name, description, color } = req.body;
  const category = await categoryService.createCategory({
    name,
    description,
    color,
    user: req.user
  });

  res.status(201).json({
    success: true,
    message: "Kategori baru berhasil dibuat",
    data: category
  });
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getCategories({ user: req.user });

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil daftar kategori",
    data: categories
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById({ id, user: req.user });

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil rincian kategori",
    data: category
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, color } = req.body;
  const category = await categoryService.updateCategory({
    id,
    updateData: { name, description, color },
    user: req.user
  });

  res.status(200).json({
    success: true,
    message: "Kategori berhasil diperbarui",
    data: category
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.deleteCategory({ id, user: req.user });

  res.status(200).json({
    success: true,
    message: "Kategori berhasil dihapus secara soft-delete",
    data: category
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
