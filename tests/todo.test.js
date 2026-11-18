const request = require("supertest");
const app = require("../src/app");
const Todo = require("../src/models/todo.model");
const ActivityLog = require("../src/models/activityLog.model");

describe("Todo Endpoints (/api/todos)", () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let categoryId;

  beforeEach(async () => {
    // Registrasi User
    const userRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Budi Todo Test",
        email: "budi.todo@todoapp.id",
        password: "Password123!",
        role: "user"
      });
    userToken = userRes.body.data.accessToken;
    userId = userRes.body.data.user._id;

    // Registrasi Admin
    const adminRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin Todo Test",
        email: "admin.todo@todoapp.id",
        password: "Password123!",
        role: "admin"
      });
    adminToken = adminRes.body.data.accessToken;
    adminId = adminRes.body.data.user._id;

    // Buat Kategori untuk User
    const catRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "Kategori Utama",
        color: "#3B82F6"
      });
    categoryId = catRes.body.data._id;
  });

  describe("POST /api/todos", () => {
    it("harus berhasil membuat todo dan otomatis mencatat CREATE_TODO ke activity_logs (status 201)", async () => {
      const res = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Implementasi Unit Test Todo",
          description: "Menulis automated testing menggunakan Jest dan Supertest",
          priority: "high",
          dueDate: "2026-12-31T23:59:59.000Z",
          category: categoryId
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("title", "Implementasi Unit Test Todo");
      expect(res.body.data.priority).toBe("high");
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.archived).toBe(false);
      expect(res.body.data.created_by.toString()).toBe(userId.toString());

      // Verifikasi pencatatan log aktivitas
      const log = await ActivityLog.findOne({
        todoId: res.body.data._id,
        action: "CREATE_TODO"
      });
      expect(log).toBeTruthy();
      expect(log.userId.toString()).toBe(userId.toString());
    });

    it("harus mengembalikan status 404 jika kategori tidak ditemukan", async () => {
      const fakeMongoId = "507f1f77bcf86cd799439011";
      const res = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Todo Kategori Salah",
          category: fakeMongoId
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("harus mengembalikan status 422 jika judul todo kosong", async () => {
      const res = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "",
          category: categoryId
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/todos (Search, Filter, Sort, Pagination)", () => {
    beforeEach(async () => {
      // Buat 3 todo dengan variasi
      await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Belajar Arsitektur Node.js",
          description: "Controller service model pattern",
          priority: "low",
          completed: true,
          category: categoryId
        });

      await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Menulis Dokumentasi Postman",
          description: "Export collection v2.1",
          priority: "high",
          completed: false,
          category: categoryId
        });

      await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Konfigurasi Swagger OpenAPI 3.0",
          description: "Setup custom CSS dan UI Express",
          priority: "medium",
          completed: false,
          category: categoryId
        });
    });

    it("harus berhasil mengambil daftar todo beserta pagination standar", async () => {
      const res = await request(app)
        .get("/api/todos?page=1&limit=2")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body).toHaveProperty("pagination");
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.totalItems).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it("harus mendukung filtering berdasarkan status completed", async () => {
      const res = await request(app)
        .get("/api/todos?completed=true")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].completed).toBe(true);
      expect(res.body.data[0].title).toBe("Belajar Arsitektur Node.js");
    });

    it("harus mendukung search teks regex case-insensitive", async () => {
      const res = await request(app)
        .get("/api/todos?search=swagger")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toContain("Swagger");
    });
  });

  describe("PUT & DELETE /api/todos/:id", () => {
    let testTodoId;

    beforeEach(async () => {
      const todoRes = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Tugas Untuk Update & Delete",
          priority: "medium",
          category: categoryId
        });
      testTodoId = todoRes.body.data._id;
    });

    it("harus berhasil memperbarui todo dan mencatat UPDATE_TODO (status 200)", async () => {
      const res = await request(app)
        .put(`/api/todos/${testTodoId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Tugas Sudah Diperbarui",
          completed: true,
          priority: "high"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Tugas Sudah Diperbarui");
      expect(res.body.data.completed).toBe(true);
      expect(res.body.data.priority).toBe("high");

      const log = await ActivityLog.findOne({
        todoId: testTodoId,
        action: "UPDATE_TODO"
      });
      expect(log).toBeTruthy();
    });

    it("harus melakukan soft delete (archived: true) dan mencatat DELETE_TODO (status 200)", async () => {
      const res = await request(app)
        .delete(`/api/todos/${testTodoId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.archived).toBe(true);

      const dbDoc = await Todo.findById(testTodoId);
      expect(dbDoc.archived).toBe(true);

      const log = await ActivityLog.findOne({
        todoId: testTodoId,
        action: "DELETE_TODO"
      });
      expect(log).toBeTruthy();
    });
  });

  describe("DELETE /api/todos/admin/all (RBAC Endpoint)", () => {
    it("harus menolak akses untuk role user biasa dengan status 403 Forbidden", async () => {
      const res = await request(app)
        .delete("/api/todos/admin/all")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("harus mengizinkan role admin untuk mengarsipkan seluruh todo aktif (status 200)", async () => {
      // Buat 1 todo
      await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Todo Milik User",
          category: categoryId
        });

      const res = await request(app)
        .delete("/api/todos/admin/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("archivedCount");
    });
  });
});
