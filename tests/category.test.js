const request = require("supertest");
const app = require("../src/app");
const Category = require("../src/models/category.model");
const Todo = require("../src/models/todo.model");

describe("Category Endpoints (/api/categories)", () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeEach(async () => {
    // Registrasi User Biasa
    const userRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User Biasa",
        email: "user.biasa@todoapp.id",
        password: "Password123!",
        role: "user"
      });
    userToken = userRes.body.data.accessToken;
    userId = userRes.body.data.user._id;

    // Registrasi Admin
    const adminRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Admin User",
        email: "admin.user@todoapp.id",
        password: "Password123!",
        role: "admin"
      });
    adminToken = adminRes.body.data.accessToken;
    adminId = adminRes.body.data.user._id;
  });

  describe("POST /api/categories", () => {
    it("harus berhasil membuat kategori baru bagi pengguna terautentikasi (status 201)", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Proyek Pribadi",
          description: "Rencana pengembangan aplikasi portofolio",
          color: "#10B981"
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("name", "Proyek Pribadi");
      expect(res.body.data).toHaveProperty("color", "#10B981");
      expect(res.body.data.owner.toString()).toBe(userId.toString());
      expect(res.body.data.created_by.toString()).toBe(userId.toString());
      expect(res.body.data.archived).toBe(false);
    });

    it("harus menolak request tanpa token JWT dengan status 401", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({
          name: "Tanpa Token"
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("harus mengembalikan status 422 jika nama kategori kosong", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          description: "Tanpa nama"
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/categories", () => {
    it("pengguna biasa hanya melihat kategori miliknya sendiri, admin melihat semua", async () => {
      // Buat kategori milik user
      await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Kategori User" });

      // Buat kategori milik admin
      await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Kategori Admin" });

      // Request oleh user
      const userFetch = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${userToken}`);

      expect(userFetch.status).toBe(200);
      expect(userFetch.body.data.length).toBe(1);
      expect(userFetch.body.data[0].name).toBe("Kategori User");

      // Request oleh admin
      const adminFetch = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminFetch.status).toBe(200);
      expect(adminFetch.body.data.length).toBe(2);
    });
  });

  describe("GET /api/categories/:id", () => {
    it("harus mengembalikan detail kategori beserta daftar todo aktif di dalamnya (status 200)", async () => {
      const catRes = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Kategori dengan Todo" });

      const categoryId = catRes.body.data._id;

      // Buat 1 todo di dalam kategori ini
      await Todo.create({
        title: "Tugas Terkait",
        category: categoryId,
        owner: userId,
        created_by: userId,
        updated_by: userId,
        archived: false
      });

      const res = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("todos");
      expect(res.body.data.todos.length).toBe(1);
      expect(res.body.data.todos[0].title).toBe("Tugas Terkait");
    });
  });

  describe("DELETE /api/categories/:id", () => {
    it("harus menerapkan soft-delete (archived: true) dan tidak menghapus dokumen secara permanen", async () => {
      const catRes = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Kategori Akan Dihapus" });

      const categoryId = catRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.archived).toBe(true);

      const dbDoc = await Category.findById(categoryId);
      expect(dbDoc).toBeTruthy();
      expect(dbDoc.archived).toBe(true);
    });
  });
});
