# Todo List Management REST API

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%20%26%20RBAC-000000?logo=jsonwebtokens&logoColor=white)
![OpenAPI](https://img.shields.io/badge/Docs-Swagger%20OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)

Backend REST API untuk pengelolaan daftar tugas (*todo*) personal dan tim dengan autentikasi ganda (JWT Access & Refresh Token), otorisasi berbasis peran (Role-Based Access Control: `user` dan `admin`), mekanisme **Soft Delete** (`archived: true`), pencatatan riwayat aktivitas pengguna (*activity log*), serta endpoint machine-to-machine terlindungi **API Key** (`x-api-key`) dan **Rate Limiting**.

---

## Fitur Utama Sistem

1. **Arsitektur Controller-Service-Model**: Pemisahan layer HTTP handler, business logic, dan skema data Mongoose.
2. **Sistem Autentikasi Stateless**:
   - Access Token (JWT kedaluwarsa 1 hari).
   - Refresh Token (JWT kedaluwarsa 7 hari) disimpan di database untuk rotasi token aman.
   - Hashing kata sandi satu arah dengan `bcryptjs` (salt rounds 10).
3. **Role-Based Access Control (RBAC)**:
   - Role `user`: Hanya dapat mengakses dan mengelola resource miliknya sendiri.
   - Role `admin`: Dapat melihat seluruh data kategori, todo, dan riwayat aktivitas, serta memiliki akses ke rute khusus (`DELETE /api/todos/admin/all`).
4. **Mekanisme Soft Delete**: Dokumen yang dihapus tidak langsung hilang dari database fisik, melainkan ditandai dengan flag `archived: true` serta mencatat `updated_by`.
5. **Pencarian Data Lanjutan (Todos)**:
   - *Filtering*: Berdasarkan `completed`, `priority`, dan `category`.
   - *Sorting*: Berdasarkan `created_at`, `dueDate`, `title`, atau `priority` (urutan `asc` / `desc`).
   - *Pagination*: Struktur pagination standar (`page`, `limit`, `totalPages`, `totalItems`).
   - *Search*: Pencarian teks bebas (case-insensitive regex) pada judul dan deskripsi tugas.
6. **Machine-to-Machine Integration (M2M)**:
   - Endpoint statistik `/api/stats/summary` dan `/api/stats/activity-logs`.
   - Terlindungi header `x-api-key` dan pembatasan frekuensi akses (*rate limiting*).
7. **Dokumentasi Interaktif Swagger UI**: Tersedia langsung di `/api-docs` dengan dukungan skema autentikasi `bearerAuth` dan `apiKeyAuth`.

---

## Tech Stack & Libraries

- **Runtime & Framework**: Node.js & Express.js (CommonJS)
- **Database & ODM**: MongoDB & Mongoose
- **Keamanan & Autentikasi**: `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `dotenv`
- **Validasi Input**: `express-validator`
- **Dokumentasi API**: `swagger-jsdoc` & `swagger-ui-express` (OpenAPI 3.0)
- **Pengujian Otomatis**: `jest`, `supertest`, `mongodb-memory-server`
- **Development**: `nodemon`

---

## Struktur Direktori Proyek

```text
todo-management-api/
├── api/
│   └── index.js                        # Entry point Serverless Vercel
├── src/
│   ├── config/
│   │   ├── db.js                       # Koneksi database Mongoose
│   │   └── swagger.js                  # Konfigurasi Swagger OpenAPI 3.0
│   ├── middlewares/
│   │   ├── apiKey.middleware.js        # Verifikasi header x-api-key
│   │   ├── auth.middleware.js          # Verifikasi Bearer Token JWT
│   │   ├── errorHandler.middleware.js  # Global centralized error handler
│   │   ├── logger.middleware.js        # HTTP request & latency logger
│   │   ├── notFound.middleware.js      # Handler 404 Not Found
│   │   ├── rateLimiter.middleware.js   # Pembatasan request rate-limit
│   │   ├── restrictTo.middleware.js    # Otorisasi role RBAC (user/admin)
│   │   └── validate.middleware.js      # Validator express-validator
│   ├── validators/
│   │   ├── auth.validator.js           # Skema validasi Auth
│   │   ├── category.validator.js       # Skema validasi Category
│   │   └── todo.validator.js           # Skema validasi Todo
│   ├── models/
│   │   ├── user.model.js               # Skema MongoDB Users
│   │   ├── category.model.js           # Skema MongoDB Categories
│   │   ├── todo.model.js               # Skema MongoDB Todos
│   │   └── activityLog.model.js        # Skema MongoDB Activity Logs
│   ├── services/
│   │   ├── auth.service.js             # Logika bisnis autentikasi
│   │   ├── category.service.js         # Logika bisnis CRUD kategori
│   │   ├── todo.service.js             # Logika bisnis CRUD & query tugas
│   │   ├── activityLog.service.js      # Logika pencatatan aktivitas
│   │   └── stats.service.js            # Logika agregasi statistik sistem
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── category.controller.js
│   │   ├── todo.controller.js
│   │   ├── activityLog.controller.js
│   │   └── stats.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── todo.routes.js
│   │   ├── activityLog.routes.js
│   │   └── stats.routes.js
│   ├── utils/
│   │   ├── AppError.js                 # Custom operational error class
│   │   ├── catchAsync.js               # Async controller wrapper
│   │   └── seeder.js                   # Seeder data awal (Admin, User, Todo)
│   ├── app.js                          # Bootstrap Express app
│   └── server.js                       # HTTP server listener
├── tests/
│   ├── setup.js                        # Setup mongodb-memory-server
│   ├── auth.test.js                    # Pengujian Auth & Tokens
│   ├── category.test.js                # Pengujian CRUD Category
│   ├── todo.test.js                    # Pengujian Todo & Pagination
│   └── stats.test.js                   # Pengujian Stats M2M & API Key
├── docs/
│   ├── PRE_PRODUCTION_PLAN.md          # Dokumen 9 Checklist Pre-Production
│   ├── Manual_Book_Teknis.md           # Manual Book Teknis Arsitektur & Payload
│   └── Postman_Collection.json         # Koleksi Postman siap import
├── .gitignore
├── jest.config.js
├── vercel.json
├── package.json
└── README.md
```

---

## Panduan Instalasi & Konfigurasi

### 1. Clone Repositori & Install Dependensi
```bash
cd todo-management-api
npm install
```

### 2. Konfigurasi Environment Variable
Buat file `.env` di root proyek dan atur variabel lingkungan berikut sesuai konfigurasi lokal/produksi Anda (jangan mengunggah file `.env` ke repositori):

| Variabel | Deskripsi |
| :--- | :--- |
| `PORT` | Port server aplikasi |
| `NODE_ENV` | Mode lingkungan aplikasi (`development` / `production`) |
| `MONGODB_URI` | String koneksi database MongoDB |
| `JWT_SECRET` | Kunci rahasia penandatanganan Access Token |
| `JWT_EXPIRES_IN` | Masa berlaku Access Token |
| `JWT_REFRESH_SECRET` | Kunci rahasia penandatanganan Refresh Token |
| `JWT_REFRESH_EXPIRES_IN` | Masa berlaku Refresh Token |
| `EXTERNAL_API_KEY` | Kunci proteksi endpoint machine-to-machine (`x-api-key`) |

### 3. Menjalankan Seeder Data Awal
Untuk mengisi database dengan akun admin, akun user biasa, 3 kategori, 9 todo realistis, dan log aktivitas awal:
```bash
npm run seed
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses server: `http://localhost:3000`
Akses dokumentasi Swagger UI: `http://localhost:3000/api-docs`

### 5. Menjalankan Automated Testing
```bash
npm test
```

---

## Ringkasan Endpoint REST API

| Method | Endpoint | Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Registrasi pengguna baru |
| `POST` | `/api/auth/login` | Publik | Login & memperoleh Access + Refresh Token |
| `POST` | `/api/auth/refresh` | Publik | Menerbitkan Access Token baru via Refresh Token |
| `POST` | `/api/categories` | User / Admin | Membuat kategori tugas baru |
| `GET` | `/api/categories` | User / Admin | Mengambil semua kategori aktif |
| `GET` | `/api/categories/:id` | Owner / Admin | Mengambil detail kategori & daftar todo di dalamnya |
| `PUT` | `/api/categories/:id` | Owner / Admin | Memperbarui metadata kategori |
| `DELETE`| `/api/categories/:id` | Owner / Admin | Soft delete kategori (cascade ke todo terkait) |
| `POST` | `/api/todos` | User / Admin | Membuat tugas baru (otomatis rekam `CREATE_TODO`) |
| `GET` | `/api/todos` | User / Admin | Mengambil daftar tugas (Search, Filter, Sort, Page) |
| `GET` | `/api/todos/:id` | Owner / Admin | Mengambil rincian tugas berdasarkan ID |
| `PUT` | `/api/todos/:id` | Owner / Admin | Memperbarui tugas (otomatis rekam `UPDATE_TODO`) |
| `DELETE`| `/api/todos/:id` | Owner / Admin | Soft delete tugas (otomatis rekam `DELETE_TODO`) |
| `DELETE`| `/api/todos/admin/all` | Admin Only | Pengarsipan seluruh tugas aktif oleh admin |
| `GET` | `/api/activity-logs` | User / Admin | Mengambil riwayat log aktivitas pengguna |
| `GET` | `/api/stats/summary` | API Key (`x-api-key`) | Ringkasan statistik sistem untuk M2M eksternal |
| `GET` | `/api/stats/activity-logs`| API Key (`x-api-key`) | Log aktivitas pemantauan eksternal |
