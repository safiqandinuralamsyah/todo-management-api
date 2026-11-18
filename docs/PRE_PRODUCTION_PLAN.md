# DOKUMEN RANCANGAN TAHAP PRE-PRODUCTION
## Backend API Todo List Management

Dokumen ini mendokumentasikan 9 komponen tahapan **Pre-Production** wajib sebelum sistem API diluncurkan ke tahap pengembangan lanjutan dan pengujian akhir.

---

### 1. Setup `package.json` dan Instalasi Dependensi
Proyek diinisialisasi menggunakan CommonJS di lingkungan Node.js (v18+) dengan dependensi terpilih:
- **Dependensi Utama:**
  - `express`: Framework server HTTP utama.
  - `mongoose`: ODM untuk pemodelan data dan relasi MongoDB.
  - `dotenv`: Pengelolaan variabel lingkungan (`.env`).
  - `bcryptjs`: Hashing kata sandi berbasis salt (10 rounds).
  - `jsonwebtoken`: Autentikasi stateless (Access Token & Refresh Token).
  - `express-validator`: Sanitasi dan validasi skema input request.
  - `express-rate-limit`: Proteksi brute-force & pembatasan traffic endpoint.
  - `swagger-jsdoc` & `swagger-ui-express`: OpenAPI 3.0 specification interaktif di `/api-docs`.
- **DevDependencies:**
  - `nodemon`: Hot-reloading saat fase pengembangan.
  - `jest`: Test runner pengujian otomatis.
  - `supertest`: HTTP assertions tanpa menjalankan port server fisik.
  - `mongodb-memory-server`: Server MongoDB in-memory untuk isolasi pengujian otomatis.

---

### 2. Konfigurasi Koneksi Database MongoDB
Koneksi database dikonfigurasi secara modular di `src/config/db.js` dengan memanfaatkan environment variable `MONGODB_URI`. Modul ini mengimplementasikan koneksi persisten untuk environment lokal dan re-use koneksi (singleton pattern) untuk runtime serverless (Vercel).

Variabel konfigurasi pada `.env` (isi dengan kredensial Anda sendiri secara lokal dan jangan diunggah ke repositori):
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=<YOUR_MONGODB_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=<YOUR_JWT_REFRESH_SECRET>
JWT_REFRESH_EXPIRES_IN=7d
EXTERNAL_API_KEY=<YOUR_EXTERNAL_API_KEY>
```

---

### 3. Pengujian Koneksi Database
Modul `src/config/db.js` dirancang untuk memverifikasi kesiapan koneksi sebelum server HTTP menerima traffic:
- Saat koneksi berhasil, sistem mencetak log: `MongoDB connected successfully: <host>`.
- Jika `MONGODB_URI` tidak ditemukan atau terjadi kegagalan jaringan, sistem mencatat detail error ke stderr dan mematikan proses (`process.exit(1)`) demi mencegah aplikasi berjalan dalam kondisi rusak.

---

### 4. Penentuan Struktur Dokumen dan Tipe Field

| Resource | Field Utama | Tipe Data | Keterangan & Batasan |
| :--- | :--- | :--- | :--- |
| **User** | `name` | String | 2–100 karakter, trim |
| | `email` | String | Unique, lowercase, format email valid |
| | `password` | String | Minimal 6 karakter, di-hash dengan bcrypt |
| | `role` | String | Enum: `['user', 'admin']`, default: `user` |
| | `refreshToken` | String | Default: `null`, `select: false` |
| | *Audit Fields* | ObjectId & Boolean | `created_by`, `updated_by`, `archived` |
| **Category** | `name` | String | 2–100 karakter, trim |
| | `description` | String | Teks ringkas, default: `""` |
| | `color` | String | Kode Hex (`#3B82F6`) |
| | `owner` | ObjectId | Ref: `User` |
| | *Audit Fields* | ObjectId & Boolean | `created_by`, `updated_by`, `archived` |
| **Todo** | `title` | String | 1–200 karakter, trim |
| | `description` | String | Teks ringkas |
| | `completed` | Boolean | Default: `false` |
| | `priority` | String | Enum: `['low', 'medium', 'high']`, default: `medium` |
| | `dueDate` | Date | Timestamp ISO8601, default: `null` |
| | `category` | ObjectId | Ref: `Category` |
| | `owner` | ObjectId | Ref: `User` |
| | *Audit Fields* | ObjectId & Boolean | `created_by`, `updated_by`, `archived` |
| **ActivityLog** | `action` | String | Enum: `CREATE_TODO`, `UPDATE_TODO`, `DELETE_TODO`, `CREATE_CATEGORY`, `UPDATE_CATEGORY`, `DELETE_CATEGORY` |
| | `todoId` | ObjectId | Ref: `Todo`, nullable |
| | `categoryId` | ObjectId | Ref: `Category`, nullable |
| | `userId` | ObjectId | Ref: `User` (pelaku) |
| | `details` | String | Deskripsi aktivitas |
| | `metadata` | Mixed/Object | Snapshot perubahan data |
| | *Audit Fields* | ObjectId & Boolean | `created_by`, `updated_by`, `archived` |

---

### 5. Desain Schema & Collection Mongoose
File schema diletakkan di `src/models/`:
- `src/models/user.model.js`: Memuat hook pre-save bcrypt, method `comparePassword`, indeks unik pada email.
- `src/models/category.model.js`: Indeks gabungan `{ owner: 1, archived: 1 }`.
- `src/models/todo.model.js`: Indeks majemuk `{ owner: 1, archived: 1, completed: 1, priority: 1, dueDate: 1 }` dan Text Index untuk pencarian.
- `src/models/activityLog.model.js`: Indeks kronologis `{ userId: 1, action: 1, created_at: -1 }`.

Seluruh dokumen menggunakan opsi otomatis timestamps:
```javascript
{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
```

---

### 6. Perancangan Endpoint REST API & Aturan Akses

| Method | Endpoint | Hak Akses | Deskripsi Operasi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Pendaftaran pengguna baru |
| `POST` | `/api/auth/login` | Publik | Otentikasi dan penerbitan token |
| `POST` | `/api/auth/refresh` | Publik | Refresh token rotasi access token |
| `POST` | `/api/categories` | User/Admin | Pembuatan kategori baru |
| `GET` | `/api/categories` | User/Admin | Mengambil kategori aktif milik user |
| `GET` | `/api/categories/:id` | Owner/Admin | Detail kategori beserta daftar todo |
| `PUT` | `/api/categories/:id` | Owner/Admin | Update metadata kategori |
| `DELETE`| `/api/categories/:id` | Owner/Admin | Soft delete kategori & cascade todo |
| `POST` | `/api/todos` | User/Admin | Tambah tugas baru & auto-log |
| `GET` | `/api/todos` | User/Admin | List tugas (Search, Filter, Sort, Page) |
| `GET` | `/api/todos/:id` | Owner/Admin | Detail tugas berdasarkan ID |
| `PUT` | `/api/todos/:id` | Owner/Admin | Update tugas & auto-log |
| `DELETE`| `/api/todos/:id` | Owner/Admin | Soft delete tugas & auto-log |
| `DELETE`| `/api/todos/admin/all` | Admin Only | Pengarsipan masal oleh admin |
| `GET` | `/api/activity-logs` | User/Admin | Riwayat log aktivitas |
| `GET` | `/api/stats/summary` | API Key | Ringkasan statistik M2M |
| `GET` | `/api/stats/activity-logs`| API Key | Log aktivitas untuk monitoring eksternal |

---

### 7. Struktur Folder Proyek Lengkap
Struktur direktori menerapkan pemisahan tugas tegas (*Separation of Concerns*):
```text
todo-management-api/
├── api/index.js                        # Serverless entrypoint (Vercel)
├── src/
│   ├── config/ (db.js, swagger.js)
│   ├── middlewares/ (auth, apiKey, errorHandler, logger, notFound, rateLimiter, restrictTo, validate)
│   ├── validators/ (auth, category, todo)
│   ├── models/ (user, category, todo, activityLog)
│   ├── services/ (auth, category, todo, activityLog, stats)
│   ├── controllers/ (auth, category, todo, activityLog, stats)
│   ├── routes/ (auth, category, todo, activityLog, stats)
│   ├── utils/ (AppError, catchAsync, seeder)
│   ├── app.js                          # Express app bootstrap
│   └── server.js                       # Server listener & DB connect
├── tests/ (setup.js, auth, category, todo, stats)
├── docs/ (PRE_PRODUCTION_PLAN.md, Manual_Book_Teknis.md, Postman_Collection.json)
└── package.json, README.md, vercel.json, jest.config.js
```

---

### 8. Panduan Pengambilan Bukti Screenshot Pengerjaan
Untuk melengkapi bukti pengerjaan pada folder `"Pre-Production"`, simpan screenshot berikut:
1. **SS-01_Package_Json_Installed.png**: Tampilan terminal saat `npm install` berhasil tanpa error.
2. **SS-02_Database_Connection_Log.png**: Terminal menampilkan log `MongoDB connected successfully`.
3. **SS-03_Directory_Structure.png**: Tampilan pohon folder di VS Code / file explorer.
4. **SS-04_Seeder_Execution.png**: Eksekusi `npm run seed` dengan ringkasan 2 user, 3 kategori, 9 todo.
5. **SS-05_Test_Runner_Passed.png**: Eksekusi `npm test` yang menunjukkan seluruh test suite lulus (PASS).
6. **SS-06_Swagger_UI_Interactive.png**: Browser membuka `http://localhost:3000/api-docs`.

---

### 9. Kesesuaian dengan Referensi 12 Materi Backend
1. **Modul 01 - Pengenalan Node.js & Express:** Penggunaan CommonJS, express middleware pipeline, route grouping.
2. **Modul 02 - Arsitektur Clean Controller-Service-Model:** Pemisahan controller (I/O HTTP), service (logika bisnis), model (skema Mongoose).
3. **Modul 03 - Manajemen Konfigurasi (.env):** Isolasi credential database dan JWT secret menggunakan `dotenv`.
4. **Modul 04 - Koneksi Database Mongoose:** Singleton connection, autoIndex, dan handling connection lifecycle.
5. **Modul 05 - Skema & Relasi Database:** Penerapan 4 collection terintegrasi dengan `ObjectId ref` dan `.populate()`.
6. **Modul 06 - Hashing & Enkripsi Password:** Implementasi `bcryptjs` salt rounds 10 pada hook `pre("save")`.
7. **Modul 07 - Autentikasi JWT & Refresh Token:** Bearer Token header, token expiry, dan endpoint rotasi refresh token.
8. **Modul 08 - Otorisasi Role-Based Access Control (RBAC):** Middleware `restrictTo("admin")` pemutus hak akses.
9. **Modul 09 - Validasi Input Terpusat:** Penggunaan `express-validator` dengan format respon error 422 seragam.
10. **Modul 10 - Centralized Error Handling:** Global middleware 4-parameter, penanganan `CastError`, duplicate key `11000`, `JsonWebTokenError`.
11. **Modul 11 - Fitur Lanjutan Query:** Filter completed/priority/category, sorting asc/desc, pagination limit/skip, text regex search.
12. **Modul 12 - Security Hardening & M2M API Key:** Header `x-api-key`, `express-rate-limit`, soft-delete audit fields.
