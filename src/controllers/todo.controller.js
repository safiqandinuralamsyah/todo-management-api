const todoService = require("../services/todo.service");
const catchAsync = require("../utils/catchAsync");

const createTodo = catchAsync(async (req, res) => {
  const { title, description, completed, priority, dueDate, category } = req.body;
  const todo = await todoService.createTodo({
    title,
    description,
    completed,
    priority,
    dueDate,
    category,
    user: req.user
  });

  res.status(201).json({
    success: true,
    message: "Tugas baru berhasil dibuat",
    data: todo
  });
});

const getTodos = catchAsync(async (req, res) => {
  const result = await todoService.getTodos({
    user: req.user,
    query: req.query
  });

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil daftar tugas",
    data: result.todos,
    pagination: result.pagination
  });
});

const getTodoById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const todo = await todoService.getTodoById({ id, user: req.user });

  res.status(200).json({
    success: true,
    message: "Berhasil mengambil rincian tugas",
    data: todo
  });
});

const updateTodo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, priority, dueDate, category } = req.body;
  const todo = await todoService.updateTodo({
    id,
    updateData: { title, description, completed, priority, dueDate, category },
    user: req.user
  });

  res.status(200).json({
    success: true,
    message: "Tugas berhasil diperbarui",
    data: todo
  });
});

const deleteTodo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const todo = await todoService.deleteTodo({ id, user: req.user });

  res.status(200).json({
    success: true,
    message: "Tugas berhasil dihapus secara soft-delete",
    data: todo
  });
});

const adminArchiveAll = catchAsync(async (req, res) => {
  const result = await todoService.adminArchiveAllTodos({ user: req.user });

  res.status(200).json({
    success: true,
    message: "Seluruh tugas aktif berhasil diarsipkan oleh admin",
    data: result
  });
});

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  adminArchiveAll
};
