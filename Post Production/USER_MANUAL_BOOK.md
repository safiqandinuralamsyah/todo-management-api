# USER MANUAL BOOK
## Panduan Penggunaan Proyek Backend REST API — Todo List Management

| Informasi Dokumen | Keterangan |
| :--- | :--- |
| **Nama Lengkap** | Safiq Andi Nur Alamsyah |
| **Nomor Siswa / Identitas** | - |
| **Kelas / Jurusan** | Rekayasa Perangkat Lunak / Web Development |
| **Institusi** | Proyek Portofolio Mandiri |
| **Nama Proyek** | Todo List Management REST API |
| **Versi Dokumen** | v1.0.0 |
| **Tanggal Dibuat** | 19 November 2026 |
| **Repositori GitHub** | [https://github.com/safiqandinuralamsyah/todo-management-api.git](https://github.com/safiqandinuralamsyah/todo-management-api.git) |
| **Live API Deployment** | [https://todo-management-api.vercel.app/api-docs](https://todo-management-api.vercel.app/api-docs) |

---

## 1. Pendahuluan

### 1.1 Apa Itu Dokumen Ini?
Dokumen ini adalah **User Manual Book**, yaitu buku panduan komprehensif mengenai cara menginstalasi, mengonfigurasi, menjalankan, dan menguji proyek backend **Todo List Management REST API**. Buku ini disusun agar penguji, kolaborator, dan pengguna dapat memahami arsitektur sistem, aturan keamanan, serta cara memanggil seluruh endpoint API yang tersedia.

> [!TIP]
> Bacalah panduan ini secara berurutan mulai dari Bagian 1 hingga Bagian 7 sebelum menjalankan server aplikasi.

### 1.2 Deskripsi Proyek
Proyek ini adalah backend REST API tingkat produksi (*production-ready*) untuk manajemen tugas (*todo list*) dan kategori dengan sistem keamanan berlapis. Fitur unggulan proyek ini meliputi:
1. **Autentikasi Ganda**: Access Token (JWT berdurasi 1 hari) dan Refresh Token (JWT berdurasi 7 hari dengan mekanisme rotasi aman).
2. **Role-Based Access Control (RBAC)**: Pemisahan hak akses antara role `user` (hanya dapat mengelola data miliknya) dan `admin` (dapat memantau seluruh data dan mengarsipkan tugas secara massal).
3. **Mekanisme Soft Delete**: Dokumen yang dihapus tidak langsung dihilangkan dari basis data fisik, melainkan ditandai dengan flag `archived: true` serta mencatat audit trail `updated_by`.
4. **Pencarian & Penyaringan Lanjutan**: Mendukung filtering status selesai, kategori, tingkat prioritas, pagination dinamis (`page` & `limit`), penyortiran (`sortBy` & `order`), serta pencarian teks bebas (case-insensitive regex).
5. **Machine-to-Machine Integration (M2M)**: Endpoint agregasi statistik dan pemantauan sistem yang dilindungi oleh header `x-api-key` dan Rate Limiting.
6. **Dokumentasi Interaktif**: Terintegrasi langsung dengan Swagger UI (OpenAPI 3.0).

### 1.3 Teknologi yang Digunakan

| Teknologi / Library | Versi | Kegunaan Utama |
| :--- | :--- | :--- |
| **Node.js** | v18.x / v20.x atau lebih baru | Lingkungan runtime JavaScript sisi server |
| **Express.js** | ^4.21.0 | Framework web dan perutean HTTP backend |
| **MongoDB & Mongoose** | ^8.8.0 | Basis data NoSQL dan Object Data Modeling (ODM) |
| **JSON Web Token (jsonwebtoken)** | ^9.0.2 | Penerbitan dan verifikasi stateless token autentikasi (Access & Refresh Token) |
| **Bcryptjs** | ^2.4.3 | Pengacakan (hashing) kata sandi satu arah dengan salt rounds 10 |
| **Express-Validator** | ^7.2.0 | Validasi dan sanitasi input body, parameter, dan query HTTP |
| **Express-Rate-Limit** | ^7.4.1 | Proteksi serangan DoS / brute-force pembatasan frekuensi request |
| **Swagger UI & Swagger-JSDoc** | ^5.0.0 / ^6.2.8 | Pembuatan dokumentasi API interaktif berbasis spesifikasi OpenAPI 3.0 |
| **Jest & Supertest** | ^29.7.0 / ^7.0.0 | Framework pengujian otomatis unit dan integration testing |
| **Mongodb-Memory-Server** | ^10.1.0 | Server in-memory MongoDB terisolasi untuk proses testing otomatis |
| **Dotenv** | ^16.4.5 | Pengelolaan konfigurasi environment variable |

### 1.4 Prasyarat Sistem
Sebelum menjalankan aplikasi, pastikan perangkat Anda telah memenuhi prasyarat berikut:
- **Node.js**: Versi 18.x atau lebih tinggi (unduh di [nodejs.org](https://nodejs.org/)).
- **npm**: Bawaan dari instalasi Node.js (minimal versi 9.x).
- **MongoDB**: MongoDB lokal (port 27017) atau akun cloud MongoDB Atlas.
- **Git**: Untuk proses cloning dan manajemen versi.
- **Postman**: Untuk pengujian manual endpoint API.
- **Visual Studio Code**: Kode editor yang direkomendasikan.

---

## 2. Struktur Folder Proyek

### 2.1 Gambaran Umum Direktori

```text
todo-management-api/
├── api/
│   └── index.js                        ← Entry point serverless deployment (Vercel)
├── docs/
│   ├── Manual_Book_Teknis.md           ← Spesifikasi teknis arsitektur & payload
│   ├── PRE_PRODUCTION_PLAN.md          ← Dokumen 9 checklist perencanaan
│   ├── Postman_Collection.json         ← Koleksi Postman 18 request siap impor
│   └── Postman_Environment.json        ← Variabel environment Postman
├── Post Production/
│   ├── USER_MANUAL_BOOK.md             ← Buku panduan operasional proyek ini
│   └── LINK_GITHUB.md                  ← Tautan repositori dan live deployment
├── Pre-Production/                     ← Bukti screenshot tahap pre-production
├── Production stage 2/                 ← Bukti screenshot pengujian Postman & Swagger
│   ├── Postman/                        ← Screenshot runner Postman
│   └── Swagger/                        ← Screenshot Swagger UI interaktif
├── src/
│   ├── config/
│   │   ├── db.js                       ← Pengaturan koneksi database Mongoose
│   │   ├── swagger.js                  ← Konfigurasi Swagger UI (CDN bundle)
│   │   └── swaggerSpec.json            ← OpenAPI spec pre-generated
│   ├── controllers/                    ← Handler request HTTP dan response JSON
│   │   ├── activityLog.controller.js
│   │   ├── auth.controller.js
│   │   ├── category.controller.js
│   │   ├── stats.controller.js
│   │   └── todo.controller.js
│   ├── middlewares/                    ← Middleware proteksi & filter perantara
│   │   ├── apiKey.middleware.js        ← Pemeriksaan header x-api-key
│   │   ├── auth.middleware.js          ← Verifikasi Bearer Token JWT (protect)
│   │   ├── errorHandler.middleware.js  ← Global error handler terpusat 4-parameter
│   │   ├── logger.middleware.js        ← Pencatatan riwayat request HTTP
│   │   ├── notFound.middleware.js      ← Handler 404 rute tidak terdaftar
│   │   ├── rateLimiter.middleware.js   ← Pembatasan laju traffic IP
│   │   ├── restrictTo.middleware.js    ← Otorisasi hak akses peran (RBAC)
│   │   └── validate.middleware.js      ← Handler hasil validasi express-validator
│   ├── models/                         ← Skema tabel/koleksi Mongoose & hooks
│   │   ├── activityLog.model.js
│   │   ├── category.model.js
│   │   ├── todo.model.js
│   │   └── user.model.js
│   ├── routes/                         ← Peta endpoint URL dan binding controller
│   │   ├── activityLog.routes.js
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── stats.routes.js
│   │   └── todo.routes.js
│   ├── services/                       ← Logika bisnis murni (Business Logic Layer)
│   │   ├── activityLog.service.js
│   │   ├── auth.service.js
│   │   ├── category.service.js
│   │   ├── stats.service.js
│   │   └── todo.service.js
│   ├── utils/                          ← Helper serbaguna
│   │   ├── AppError.js                 ← Custom operational error class
│   │   ├── catchAsync.js               ← Async wrapper penangkap exception
│   │   └── seeder.js                   ← Seeder data awal (admin, user, todo)
│   ├── validators/                     ← Aturan validasi express-validator
│   │   ├── auth.validator.js
│   │   ├── category.validator.js
│   │   └── todo.validator.js
│   ├── app.js                          ← Pendaftaran middleware dan rute Express
│   └── server.js                       ← Listener server HTTP lokal (port 3000)
├── tests/                              ← Suite automated unit & integration testing
│   ├── setup.js
│   ├── auth.test.js
│   ├── category.test.js
│   ├── stats.test.js
│   └── todo.test.js
├── .gitignore                          ← Proteksi file rahasia (.env, node_modules)
├── jest.config.js                      ← Konfigurasi runner Jest
├── package.json                        ← Manifest dependensi & script proyek
├── vercel.json                         ← Konfigurasi routing serverless Vercel
└── README.md                           ← Dokumentasi utama halaman depan repositori
```

> [!CAUTION]
> File `.env` dan folder `node_modules/` **TIDAK BOLEH** diunggah ke GitHub demi menjaga kerahasiaan kredensial database dan efisiensi repositori.

### 2.2 Penjelasan Per Layer Arsitektur
- **`src/config/`**: Mengelola inisialisasi koneksi basis data Mongoose (`db.js`) dengan penanganan singleton pattern untuk serverless lambda serta penyajian Swagger UI interaktif (`swagger.js`).
- **`src/models/`**: Mendefinisikan struktur skema MongoDB, validasi tipe data Mongoose, index pencarian, dan hook enkripsi password otomatis (`pre("save")`).
- **`src/controllers/`**: Menerima request HTTP dari router, mengekstrak data (`req.body`, `req.params`, `req.query`), memanggil service terkait, dan mengirimkan respons terstandarisasi.
- **`src/services/`**: Menjalankan aturan bisnis (Business Logic), validasi kepemilikan data pengguna (*ownership check*), kalkulasi pagination, serta pencatatan audit log otomatis.
- **`src/routes/`**: Menghubungkan path URL dengan middleware autentikasi, validasi schema, dan controller yang bersangkutan.
- **`src/middlewares/`**: Melakukan filtering pra-request: verifikasi token JWT (`protect`), pembatasan role (`restrictTo`), validasi API key (`apiKey`), dan rate limiter.
- **`src/utils/`**: Menyediakan abstraksi error terpusat (`AppError`) dan wrapper `catchAsync` sehingga kode controller bebas dari blok berulang `try-catch`.

---

## 3. Cara Menjalankan Proyek

### 3.1 Langkah 1 — Clone Repositori
Buka terminal (PowerShell / Command Prompt), lalu clone repositori dari GitHub:
```powershell
git clone https://github.com/safiqandinuralamsyah/todo-management-api.git
cd todo-management-api
```

### 3.2 Langkah 2 — Install Dependensi
Jalankan perintah berikut untuk mengunduh semua library yang diperlukan:
```powershell
npm install
```

### 3.3 Langkah 3 — Buat File `.env`
Buat file bernama `.env` di root folder proyek, lalu isi dengan konfigurasi berikut:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://safiqandinur_db_user:DhYVqyioLVxIvKPW@ujicoba123.6eamuzd.mongodb.net/todo_management_db?retryWrites=true&w=majority
JWT_SECRET=todo_api_access_secret_safiq_prod_2026_v2
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=todo_api_refresh_secret_safiq_prod_2026_v2
JWT_REFRESH_EXPIRES_IN=7d
EXTERNAL_API_KEY=todo_api_m2m_key_safiq_prod_2026_v2
```

### 3.4 Langkah 4 — Inisialisasi Database & Seeding Data Awal
Jalankan script seeder untuk membuat index basis data dan mengisi data awal (akun Admin, akun User, 3 kategori, 9 todo realistis, dan log aktivitas):
```powershell
npm run seed
```
*Hasil di terminal:*
```text
MongoDB connected successfully: ac-dqmxqub-shard-00-00.6eamuzd.mongodb.net
Seeding data berhasil diselesaikan!
Akun default:
- Admin: admin@todoapp.id / Admin123!
- User:  budi@todoapp.id  / User123!
```

### 3.5 Langkah 5 — Menjalankan Server Pengembangan
Jalankan server dalam mode development:
```powershell
npm run dev
```
*Tampilan di terminal:*
```text
Server running in development mode on port 3000
MongoDB connected successfully: ac-dqmxqub-shard-00-00.6eamuzd.mongodb.net
Swagger documentation available at: http://localhost:3000/api-docs
```

### 3.6 Langkah 6 — Verifikasi Status Server (Health Check)
Buka browser dan buka alamat:
```text
http://localhost:3000/
```
Respons JSON yang muncul:
```json
{
  "success": true,
  "message": "Todo List Management REST API Service is Running",
  "documentation": "/api-docs",
  "environment": "development",
  "timestamp": "2026-11-19T02:00:00.000Z"
}
```

---

## 4. Penjelasan Semua Route / Endpoint API

**Base URL Lokal:** `http://localhost:3000/api`  
**Base URL Produksi:** `https://todo-management-api.vercel.app/api`

### 4.1 Modul Autentikasi (`/auth`)

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Mendaftarkan pengguna baru (`user` atau `admin`) | Publik |
| `POST` | `/auth/login` | Login menggunakan email & password, menghasilkan Access + Refresh Token | Publik |
| `POST` | `/auth/refresh` | Menerbitkan Access Token baru menggunakan Refresh Token yang valid | Publik |

#### Contoh Request — `POST /api/auth/login`
```json
{
  "email": "budi@todoapp.id",
  "password": "User123!"
}
```
#### Contoh Response Sukses (`200 OK`):
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "6739bbd47225c50c58f00001",
      "name": "Budi Santoso",
      "email": "budi@todoapp.id",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4.2 Modul Kategori (`/categories`)

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/categories` | Membuat kategori baru (nama, deskripsi, kode hex warna) | User / Admin (Token) |
| `GET` | `/categories` | Mengambil daftar kategori aktif milik pengguna (atau semua bagi admin) | User / Admin (Token) |
| `GET` | `/categories/:id` | Mengambil detail kategori beserta daftar todo aktif di dalamnya | User / Admin (Token) |
| `PUT` | `/categories/:id` | Memperbarui nama, deskripsi, atau warna kategori | Owner / Admin (Token) |
| `DELETE`| `/categories/:id` | Soft delete kategori (otomatis mengarsipkan todo di dalamnya) | Owner / Admin (Token) |

---

### 4.3 Modul Tugas / Todos (`/todos`)

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/todos` | Membuat tugas baru (otomatis rekam `CREATE_TODO`) | User / Admin (Token) |
| `GET` | `/todos` | Mengambil daftar tugas (Search, Filter, Sort, Pagination) | User / Admin (Token) |
| `GET` | `/todos/:id` | Mengambil detail rincian tugas berdasarkan ID | Owner / Admin (Token) |
| `PUT` | `/todos/:id` | Memperbarui tugas (otomatis rekam `UPDATE_TODO`) | Owner / Admin (Token) |
| `DELETE`| `/todos/:id` | Soft delete tugas (otomatis rekam `DELETE_TODO`) | Owner / Admin (Token) |
| `DELETE`| `/todos/admin/all` | Mengarsipkan seluruh tugas aktif secara massal | Khusus Admin (RBAC) |

#### Contoh Query Filter & Pagination:
```http
GET /api/todos?page=1&limit=10&completed=false&priority=high&sortBy=dueDate&order=asc&search=Laporan
Authorization: Bearer <TOKEN_JWT>
```

---

### 4.4 Modul Riwayat Aktivitas (`/activity-logs`)

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/activity-logs` | Mengambil riwayat aktivitas pengguna (`CREATE_TODO`, `UPDATE_TODO`, dll) | User / Admin (Token) |

---

### 4.5 Modul Statistik Machine-to-Machine (`/stats`)

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats/summary` | Agregasi total todo, kategori, rasio penyelesaian, dan prioritas | Header `x-api-key` |
| `GET` | `/stats/activity-logs` | Log aktivitas pemantauan sistem eksternal | Header `x-api-key` |

---

## 5. Panduan Pengujian & Pengambilan Bukti Screenshot

### 5.1 Pengujian Menggunakan Postman
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** &rarr; masukkan file [Postman_Collection.json](file:///D:/New%20folder/todo-management-api/docs/Postman_Collection.json) dan [Postman_Environment.json](file:///D:/New%20folder/todo-management-api/docs/Postman_Environment.json).
3. Pilih Environment **"Todo Management API - Local & Production"**.
4. Buka **Collection Runner** &rarr; jalankan 18 request &rarr; ambil screenshot hasil eksekusi.
5. Simpan file screenshot ke folder:
   `D:\New folder\todo-management-api\Production stage 2\Postman\postman_runner_result.png`

### 5.2 Pengujian Dokumentasi Interaktif Swagger UI
1. Buka browser ke alamat [http://localhost:3000/api-docs](http://localhost:3000/api-docs) atau [https://todo-management-api.vercel.app/api-docs](https://todo-management-api.vercel.app/api-docs).
2. Tampilan interaktif Swagger akan merender 11 endpoint lengkap dengan skema data dan tombol otorisasi.
3. Ambil screenshot halaman browser tersebut dan simpan ke:
   `D:\New folder\todo-management-api\Production stage 2\Swagger\swagger_api_docs.png`

---

## 6. Simulasi Kasus Gagal & Penanganan Error

Sistem menerapkan arsitektur error terpusat yang memetakan jenis kegagalan ke kode status HTTP yang presisi:

| Kode HTTP | Nama Status | Penyebab Terjadinya | Format Pesan Respons |
| :--- | :--- | :--- | :--- |
| **`400`** | Bad Request | Parameter body tidak sesuai atau malformed JSON | `{"success": false, "message": "Format request tidak valid"}` |
| **`401`** | Unauthorized | Tidak menyertakan Bearer Token atau token kedaluwarsa | `{"success": false, "message": "Akses ditolak: Anda belum login..."}` |
| **`403`** | Forbidden | Pengguna biasa mencoba mengakses endpoint khusus role admin | `{"success": false, "message": "Akses terlarang: Anda tidak memiliki izin..."}` |
| **`404`** | Not Found | Resource (Todo atau Category) dengan ID tersebut tidak ditemukan / bukan milik user | `{"success": false, "message": "Tugas tidak ditemukan atau Anda tidak memiliki akses"}` |
| **`409`** | Conflict | Mendaftarkan akun baru menggunakan email yang sudah terdaftar | `{"success": false, "message": "Alamat email tersebut sudah terdaftar di sistem"}` |
| **`422`** | Unprocessable Entity | Input gagal melewati validasi skema `express-validator` | `{"success": false, "message": "Validasi input gagal", "errors": [...]}` |
| **`429`** | Too Many Requests | Melebihi ambang batas pemanggilan endpoint (Rate Limiting) | `{"success": false, "message": "Terlalu banyak permintaan..."}` |
| **`500`** | Internal Server Error | Kesalahan runtime internal tak terduga | `{"success": false, "message": "Terjadi kesalahan internal pada server"}` |

---

## 7. Penutup & Catatan Teknis

### 7.1 Cheat Sheet Perintah Penting

| Perintah | Deskripsi |
| :--- | :--- |
| `npm install` | Mengunduh semua dependensi proyek |
| `npm run seed` | Mengisi basis data dengan data awal seeder |
| `npm run dev` | Menjalankan server lokal pengembangan (port 3000) |
| `npm start` | Menjalankan server dalam mode produksi |
| `npm test` | Menjalankan seluruh 29 pengujian otomatis Jest & Supertest |
| `git status` | Memeriksa status tracking Git lokal |

### 7.2 Catatan Pengembang
Proyek ini dikembangkan dengan mematuhi prinsip **Clean Architecture (Controller-Service-Model)**, **Security Hardening (Zero-Trust, Parameterized queries, No Hardcoded Secrets)**, dan **Anti-Design Slop Directive**. Seluruh pengujian otomatis mencakup skenario positif (happy path) dan negatif (unauthorized, validation failure, rate limiting).

---
*Dokumen ini dibuat secara resmi untuk penyelesaian Post Production Stage.*  
**Safiq Andi Nur Alamsyah — 2026**
