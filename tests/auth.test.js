const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");

describe("Auth Endpoints (/api/auth)", () => {
  describe("POST /api/auth/register", () => {
    it("harus berhasil mendaftarkan user baru dengan status 201", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Budi Pratama",
          email: "budi.pratama@todoapp.id",
          password: "Password123!",
          role: "user"
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
      expect(res.body.data.user).toHaveProperty("email", "budi.pratama@todoapp.id");
      expect(res.body.data.user).not.toHaveProperty("password");

      const userInDb = await User.findOne({ email: "budi.pratama@todoapp.id" });
      expect(userInDb).toBeTruthy();
      expect(userInDb.archived).toBe(false);
    });

    it("harus mengembalikan status 409 jika email sudah terdaftar", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "User Pertama",
          email: "duplicate@todoapp.id",
          password: "Password123!"
        });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "User Kedua",
          email: "duplicate@todoapp.id",
          password: "Password123!"
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("harus mengembalikan status 422 jika input tidak valid (misal: password kurang dari 6 karakter)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Pendek",
          email: "email-invalid",
          password: "123"
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "User Login Test",
          email: "login.test@todoapp.id",
          password: "SecurePassword123!"
        });
    });

    it("harus berhasil login dengan kredensial valid dan mengembalikan status 200", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login.test@todoapp.id",
          password: "SecurePassword123!"
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("harus mengembalikan status 401 jika kata sandi salah", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login.test@todoapp.id",
          password: "WrongPassword!"
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("harus mengembalikan status 401 jika email tidak terdaftar", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "tidak.ada@todoapp.id",
          password: "SecurePassword123!"
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("harus berhasil menerbitkan access token baru dengan refresh token yang valid", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Refresh User",
          email: "refresh@todoapp.id",
          password: "SecurePassword123!"
        });

      const refreshToken = registerRes.body.data.refreshToken;

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("harus mengembalikan status 401 jika refresh token tidak valid", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "token_palsu_tidak_valid" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
