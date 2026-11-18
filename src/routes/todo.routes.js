const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller");
const {
  createTodoValidator,
  updateTodoValidator,
  todoIdValidator,
  queryTodoValidator
} = require("../validators/todo.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const restrictTo = require("../middlewares/restrictTo.middleware");

// Proteksi seluruh route todo dengan JWT
router.use(protect);

/**
 * @openapi
 * /todos:
 *   post:
 *     tags:
 *       - Todos
 *     summary: Membuat tugas baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Menyusun Laporan Keuangan Q4
 *               description:
 *                 type: string
 *                 example: Rekapitulasi transaksi dan neraca rugi laba akhir tahun
 *               completed:
 *                 type: boolean
 *                 example: false
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: high
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-31T23:59:59.000Z"
 *               category:
 *                 type: string
 *                 example: 654e9bc2a02b1f8c12345678
 *     responses:
 *       201:
 *         description: Tugas baru berhasil dibuat
 *       422:
 *         description: Validasi input gagal
 *   get:
 *     tags:
 *       - Todos
 *     summary: Mengambil daftar tugas dengan filtering, sorting, pagination, & search
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
 *           default: 10
 *       - in: query
 *         name: completed
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, dueDate, title, priority]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Daftar tugas berhasil diambil
 */
router
  .route("/")
  .post(createTodoValidator, validate, todoController.createTodo)
  .get(queryTodoValidator, validate, todoController.getTodos);

/**
 * @openapi
 * /todos/admin/all:
 *   delete:
 *     tags:
 *       - Todos
 *     summary: Mengarsipkan seluruh tugas (Khusus Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seluruh tugas berhasil diarsipkan
 *       403:
 *         description: Dilarang untuk non-admin
 */
router.delete("/admin/all", restrictTo("admin"), todoController.adminArchiveAll);

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     tags:
 *       - Todos
 *     summary: Mengambil detail tugas berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail tugas
 *       404:
 *         description: Tugas tidak ditemukan
 *   put:
 *     tags:
 *       - Todos
 *     summary: Memperbarui data tugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tugas berhasil diperbarui
 *       404:
 *         description: Tugas tidak ditemukan
 *   delete:
 *     tags:
 *       - Todos
 *     summary: Soft delete tugas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tugas berhasil diarsipkan (soft delete)
 *       404:
 *         description: Tugas tidak ditemukan
 */
router
  .route("/:id")
  .get(todoIdValidator, validate, todoController.getTodoById)
  .put(updateTodoValidator, validate, todoController.updateTodo)
  .delete(todoIdValidator, validate, todoController.deleteTodo);

module.exports = router;
