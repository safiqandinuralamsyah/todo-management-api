const { body, param } = require("express-validator");

const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama kategori wajib diisi")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama kategori harus memiliki panjang 2 hingga 100 karakter"),
  body("description")
    .optional()
    .isString()
    .withMessage("Deskripsi kategori harus berupa teks"),
  body("color")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Format warna harus merupakan kode heksadesimal yang valid (contoh: #3B82F6)")
];

const updateCategoryValidator = [
  param("id")
    .isMongoId()
    .withMessage("ID kategori pada parameter URL tidak valid"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama kategori harus memiliki panjang 2 hingga 100 karakter"),
  body("description")
    .optional()
    .isString()
    .withMessage("Deskripsi kategori harus berupa teks"),
  body("color")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Format warna harus merupakan kode heksadesimal yang valid (contoh: #3B82F6)")
];

const categoryIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("ID kategori pada parameter URL tidak valid")
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator,
  categoryIdValidator
};
