const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator
} = require("../validators/category.validator");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");

// Proteksi seluruh route kategori dengan JWT
router.use(protect);

/**
 * @openapi
 * /categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Membuat kategori tugas baru
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pekerjaan & Proyek Kantor
 *               description:
 *                 type: string
 *                 example: Daftar tugas operasional dan target deadline kantor
 *               color:
 *                 type: string
 *                 example: "#3B82F6"
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validasi input gagal
 *   get:
 *     tags:
 *       - Categories
 *     summary: Mengambil semua kategori aktif
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil
 */
router
  .route("/")
  .post(createCategoryValidator, validate, categoryController.createCategory)
  .get(categoryController.getCategories);

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Mengambil detail kategori beserta daftar todo di dalamnya
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
 *         description: Detail kategori dan todo aktif
 *       404:
 *         description: Kategori tidak ditemukan
 *   put:
 *     tags:
 *       - Categories
 *     summary: Memperbarui data kategori
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 *       404:
 *         description: Kategori tidak ditemukan
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Soft delete kategori
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
 *         description: Kategori berhasil diarsipkan (soft-delete)
 *       404:
 *         description: Kategori tidak ditemukan
 */
router
  .route("/:id")
  .get(categoryIdValidator, validate, categoryController.getCategoryById)
  .put(updateCategoryValidator, validate, categoryController.updateCategory)
  .delete(categoryIdValidator, validate, categoryController.deleteCategory);

module.exports = router;
