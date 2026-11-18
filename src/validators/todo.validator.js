const { body, param, query } = require("express-validator");

const createTodoValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Judul tugas (title) wajib diisi")
    .isLength({ min: 1, max: 200 })
    .withMessage("Judul tugas harus memiliki panjang antara 1 hingga 200 karakter"),
  body("description")
    .optional()
    .isString()
    .withMessage("Deskripsi tugas harus berupa teks"),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Status completed harus bernilai boolean (true/false)"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Prioritas hanya diperbolehkan 'low', 'medium', atau 'high'"),
  body("dueDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Format tanggal jatuh tempo (dueDate) harus berupa tanggal ISO8601 yang valid"),
  body("category")
    .notEmpty()
    .withMessage("Kategori tugas (category) wajib disertakan")
    .isMongoId()
    .withMessage("ID kategori yang diberikan tidak valid")
];

const updateTodoValidator = [
  param("id")
    .isMongoId()
    .withMessage("ID tugas pada parameter URL tidak valid"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Judul tugas harus memiliki panjang antara 1 hingga 200 karakter"),
  body("description")
    .optional()
    .isString()
    .withMessage("Deskripsi tugas harus berupa teks"),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Status completed harus bernilai boolean (true/false)"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Prioritas hanya diperbolehkan 'low', 'medium', atau 'high'"),
  body("dueDate")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === "") return true;
      if (!isNaN(Date.parse(value))) return true;
      throw new Error("Format tanggal jatuh tempo (dueDate) harus berupa tanggal ISO8601 yang valid");
    }),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("ID kategori yang diberikan tidak valid")
];

const todoIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("ID tugas pada parameter URL tidak valid")
];

const queryTodoValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Parameter page harus berupa bilangan bulat positif"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Parameter limit harus berupa bilangan bulat antara 1 hingga 100"),
  query("completed")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Parameter completed harus bernilai 'true' atau 'false'"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Parameter priority harus bernilai 'low', 'medium', atau 'high'"),
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Parameter category harus berupa ID MongoDB yang valid"),
  query("sortBy")
    .optional()
    .isIn(["created_at", "dueDate", "title", "priority"])
    .withMessage("Parameter sortBy hanya mendukung 'created_at', 'dueDate', 'title', atau 'priority'"),
  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Parameter order hanya mendukung 'asc' atau 'desc'"),
  query("search")
    .optional()
    .isString()
    .withMessage("Parameter search harus berupa teks")
];

module.exports = {
  createTodoValidator,
  updateTodoValidator,
  todoIdValidator,
  queryTodoValidator
};
