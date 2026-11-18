const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");
const Category = require("../src/models/category.model");
const Todo = require("../src/models/todo.model");
const ActivityLog = require("../src/models/activityLog.model");

describe("Stats & External M2M Endpoints (/api/stats)", () => {
  const validApiKey = "test_external_api_key_machine_to_machine_2026";

  beforeEach(async () => {
    const user = await User.create({
      name: "Stats Test User",
      email: "stats.test@todoapp.id",
      password: "Password123!",
      role: "user"
    });

    const category = await Category.create({
      name: "Kategori Statistik",
      color: "#F59E0B",
      owner: user._id,
      created_by: user._id,
      updated_by: user._id
    });

    await Todo.create([
      {
        title: "Tugas Selesai",
        completed: true,
        priority: "high",
        category: category._id,
        owner: user._id,
        created_by: user._id,
        updated_by: user._id
      },
      {
        title: "Tugas Belum Selesai",
        completed: false,
        priority: "medium",
        category: category._id,
        owner: user._id,
        created_by: user._id,
        updated_by: user._id
      }
    ]);

    await ActivityLog.create({
      action: "CREATE_TODO",
      userId: user._id,
      categoryId: category._id,
      details: "Membuat tugas untuk test stats",
      created_by: user._id,
      updated_by: user._id
    });
  });

  describe("GET /api/stats/summary", () => {
    it("harus berhasil mengembalikan ringkasan statistik dengan x-api-key valid (status 200)", async () => {
      const res = await request(app)
        .get("/api/stats/summary")
        .set("x-api-key", validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("overview");
      expect(res.body.data.overview.totalTodos).toBe(2);
      expect(res.body.data.overview.completedTodos).toBe(1);
      expect(res.body.data.overview.pendingTodos).toBe(1);
      expect(res.body.data.overview.totalCategories).toBe(1);
      expect(res.body.data).toHaveProperty("todosPerCategory");
      expect(res.body.data.todosPerCategory.length).toBe(1);
    });

    it("harus menolak request tanpa header x-api-key dengan status 401", async () => {
      const res = await request(app).get("/api/stats/summary");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("x-api-key");
    });

    it("harus menolak request dengan x-api-key yang salah dengan status 401", async () => {
      const res = await request(app)
        .get("/api/stats/summary")
        .set("x-api-key", "kunci_salah_tidak_terdaftar");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/stats/activity-logs", () => {
    it("harus berhasil mengembalikan log pemantauan eksternal dengan x-api-key valid (status 200)", async () => {
      const res = await request(app)
        .get("/api/stats/activity-logs?limit=10")
        .set("x-api-key", validApiKey);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty("action", "CREATE_TODO");
    });

    it("harus menolak request tanpa header x-api-key dengan status 401", async () => {
      const res = await request(app).get("/api/stats/activity-logs");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
