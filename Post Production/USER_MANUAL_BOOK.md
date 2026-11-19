# USER MANUAL BOOK 
## Panduan Penggunaan Proyek Backend 

| Informasi Dokumen | Keterangan |
| :--- | :--- |
| **Nama Lengkap** | Safiq Andi Nur Alamsyah |
| **Nomor Siswa / NIS** | [NIS / NISN Siswa] |
| **Kelas / Jurusan** | XII RPL (Rekayasa Perangkat Lunak) |
| **Nama Sekolah/Kampus** | SMK / Sekolah |
| **Nama Proyek** | API To-Do List Management |
| **Versi Dokumen** | v1.0.0 |
| **Tanggal Dibuat** | 19 November 2026 |

*Dokumen ini dibuat sebagai bagian dari tugas akhir / proyek sekolah / portofolio kejuruan.*

---

## 1. Pendahuluan

### 1.1 Apa Itu Dokumen Ini?
Dokumen ini adalah **User Manual Book**, yaitu buku panduan cara menggunakan proyek backend yang sudah dibuat. Isinya menjelaskan mulai dari cara instalasi, struktur folder, konfigurasi database, sampai cara menjalankan dan menguji semua fitur yang ada baik melalui Postman maupun Swagger UI.

> [!TIP]
> Bacalah panduan ini dari awal sampai akhir sebelum mencoba menjalankan proyeknya!

### 1.2 Deskripsi Proyek
Proyek ini adalah **REST API untuk aplikasi Todo List Management** berbasis **Node.js** menggunakan framework **Express.js** dan database **MongoDB (Mongoose ODM)**. API ini menyediakan fitur manajemen tugas (*todos*), kategori (*categories*), autentikasi pengguna dengan JWT (Access & Refresh Token), otorisasi peran (*role-based access control*), mekanisme **Soft Delete** (`archived: true`), pencatatan riwayat aktivitas pengguna (*activity logs*), serta endpoint machine-to-machine terlindungi **API Key** (`x-api-key`).

### 1.3 Teknologi yang Digunakan

| Teknologi | Versi | Kegunaan |
| :--- | :--- | :--- |
| **Node.js** | v18.x / v20.x atau lebih baru | Runtime JavaScript di sisi server |
| **Express.js** | ^4.21.0 | Framework backend/API HTTP |
| **MongoDB (Atlas)** | Cloud Cluster | Database NoSQL utama |
| **Mongoose** | ^8.8.0 | ODM (*Object Data Modeling*) untuk validasi skema dan query database |
| **JWT (jsonwebtoken)** | ^9.0.2 | Autentikasi stateless menggunakan token (Access & Refresh) |
| **Bcryptjs** | ^2.4.3 | Enkripsi hashing kata sandi satu arah |
| **Express-Validator** | ^7.2.0 | Validasi dan sanitasi input body, parameter, dan query |
| **Express-Rate-Limit** | ^7.4.1 | Pembatasan frekuensi request untuk proteksi DDoS / brute-force |
| **Swagger UI & OpenAPI 3.0** | ^5.0.0 | Dokumentasi API interaktif pada route `/api-docs` |
| **Jest & Supertest** | ^29.7.0 / ^7.0.0 | Pengujian otomatis (*automated testing*) unit dan integrasi |
| **Dotenv** | ^16.4.5 | Konfigurasi variabel lingkungan (*environment variables*) |

### 1.4 Prasyarat
Sebelum memulai, pastikan komputer kamu sudah terpasang:
- **Node.js versi 18 ke atas** &rarr; bisa diunduh di [nodejs.org](https://nodejs.org/)
- **npm** (otomatis terpasang bersama Node.js)
- **MongoDB Atlas** (akun cloud aktif) atau **MongoDB Community Server** lokal
- **Postman** (untuk pengujian API)
- **VS Code** atau editor kode lainnya
- **Koneksi Internet** (untuk mengunduh paket dependensi dan terhubung ke MongoDB Atlas)

---

## 2. Struktur Folder Proyek

### 2.1 Gambaran Umum Folder
Ketika kamu membuka folder proyek di VS Code, kamu akan melihat susunan folder seperti ini:

```text
todo-management-api/
├── node_modules/        ← hasil install npm (jangan diedit!)
├── api/                 ← entry point serverless function untuk hosting Vercel
├── src/                 ← kode utama proyek
│   ├── config/          ← konfigurasi (koneksi database MongoDB & Swagger UI)
│   ├── controllers/     ← logika bisnis / handler request HTTP
│   ├── middlewares/     ← fungsi yang jalan sebelum controller (auth, logger, validator, rbac)
│   ├── models/          ← struktur skema koleksi database Mongoose
│   ├── routes/          ← daftar semua endpoint URL API
│   ├── services/        ← pemrosesan bisnis murni, kalkulasi pagination & log
│   ├── utils/           ← error handler terpusat (AppError, catchAsync) & seeder
│   ├── validators/      ← aturan validasi express-validator
│   ├── app.js           ← konfigurasi utama aplikasi Express
│   └── server.js        ← server listener lokal (port 3000)
├── tests/               ← automated testing Jest & Supertest (29 skenario tes)
├── docs/                ← dokumentasi teknis, koleksi Postman & environment
├── Pre-Production/      ← bukti pengerjaan tahap perancangan awal
├── Production stage 1/  ← bukti implementasi kode & tes terminal
├── Production stage 2/  ← bukti pengujian Postman Runner & Swagger UI
├── Post Production/     ← User Manual Book resmi (.md & .docx) dan tautan GitHub
├── .env                 ← file konfigurasi rahasia (kunci database & JWT, jangan di-upload!)
├── .gitignore           ← daftar file yang dikecualikan dari Git
├── package.json         ← info proyek & daftar dependensi library
└── README.md            ← panduan singkat proyek
```

> [!WARNING]
> Folder `node_modules/` dan file `.env` **TIDAK BOLEH** diunggah ke GitHub! Pastikan keduanya sudah terdaftar di `.gitignore`.

### 2.2 Penjelasan Tiap Folder
- **📁 src/config/**: Berisi konfigurasi koneksi database Mongoose (`db.js`) dan inisialisasi dokumentasi Swagger UI (`swagger.js`).
- **📁 src/models/**: Berisi definisi skema MongoDB dalam bentuk kode JavaScript (Mongoose Schema):
  - `user.model.js` &rarr; model tabel users dengan pre-save hook bcrypt
  - `category.model.js` &rarr; model kategori tugas
  - `todo.model.js` &rarr; model data tugas dengan referensi ke user dan kategori
  - `activityLog.model.js` &rarr; model pencatatan log riwayat aktivitas
- **📁 src/controllers/**: Berisi penerima request dari router dan pengirim response JSON. Memanggil service terkait.
- **📁 src/services/**: Berisi logika bisnis utama, kalkulasi sorting, filter regex, pagination, validasi kepemilikan data (*ownership check*), dan pencatatan log otomatis.
- **📁 src/routes/**: Berisi daftar semua endpoint URL yang tersedia:
  - `auth.routes.js` &rarr; rute untuk `/api/auth/*`
  - `category.routes.js` &rarr; rute untuk `/api/categories/*`
  - `todo.routes.js` &rarr; rute untuk `/api/todos/*`
  - `activityLog.routes.js` &rarr; rute untuk `/api/activity-logs/*`
  - `stats.routes.js` &rarr; rute untuk `/api/stats/*`
- **📁 src/middlewares/**: Berisi fungsi-fungsi perantara:
  - `auth.middleware.js` &rarr; memeriksa apakah token JWT valid (protect)
  - `restrictTo.middleware.js` &rarr; memeriksa hak akses role (`admin` vs `user`)
  - `apiKey.middleware.js` &rarr; validasi header `x-api-key` untuk endpoint machine-to-machine
  - `errorHandler.middleware.js` &rarr; menangkap dan memformat pesan error terpusat
  - `validate.middleware.js` &rarr; memeriksa error hasil validasi input
  - `rateLimiter.middleware.js` &rarr; membatasi frekuensi request per IP
  - `logger.middleware.js` &rarr; mencatat log HTTP request yang masuk
- **📁 src/utils/**: Berisi helper pendukung (`AppError.js`, `catchAsync.js`, dan script seeder `seeder.js` untuk data awal).
- **📄 .env**: Berisi data sensitif konfigurasi server lokal seperti koneksi database dan secret key JWT.

---

## 3. Cara Menjalankan Proyek

### 3.1 Langkah 1 — Clone atau Buka Proyek
Buka terminal / Command Prompt / PowerShell, lalu clone repositori dari GitHub:
```powershell
git clone https://github.com/safiqandinuralamsyah/todo-management-api.git
cd todo-management-api
```
*(Atau jika proyek sudah ada di komputermu, cukup buka folder `todo-management-api` dengan VS Code).*

### 3.2 Langkah 2 — Install Dependensi
Jalankan perintah ini untuk mengunduh semua library yang dibutuhkan:
```powershell
npm install
```
Tunggu hingga selesai sampai muncul folder `node_modules/`.

### 3.3 Langkah 3 — Buat File `.env`
Buat file bernama `.env` di root folder proyek dan isi dengan konfigurasi komputermu:
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

### 3.4 Langkah 4 — Koneksi Database MongoDB
Aplikasi ini menggunakan database **MongoDB Atlas Cloud**. Pengaturan koneksi telah ditangani otomatis oleh file `src/config/db.js` yang membaca variabel `MONGODB_URI` dari file `.env`.

### 3.5 Langkah 5 — Model & Skema Database (Mongoose)
Pada MongoDB, struktur tabel/koleksi dibuat secara otomatis oleh model Mongoose saat server dijalankan pertama kali. Tidak diperlukan perintah migrasi manual yang rumit.

### 3.6 Langkah 6 — Seeding Data Awal
Isi database dengan data awal (*dummy data*) menggunakan perintah seeder:
```powershell
npm run seed
```
Perintah ini otomatis membuat:
- 1 Akun Admin: `admin@todoapp.id` / `Admin123!`
- 1 Akun User biasa: `budi@todoapp.id` / `User123!`
- 3 Kategori bawaan
- 9 Tugas Todo realistis
- Log aktivitas awal

### 3.7 Langkah 7 — Jalankan Server
Ada dua mode yang bisa kamu pilih:
```powershell
# Mode development (otomatis restart jika ada perubahan kode)
npm run dev

# Mode production
npm start
```
Jika berhasil, kamu akan melihat pesan:
```text
Server running in development mode on port 3000
MongoDB connected successfully: ac-dqmxqub-shard-00-00.6eamuzd.mongodb.net
Swagger documentation available at: http://localhost:3000/api-docs
```

### 3.8 Cek Apakah Server Sudah Jalan
Buka browser dan ketik alamat:
```text
http://localhost:3000
```
Jika muncul response JSON seperti di bawah ini, berarti servermu sudah berjalan dengan benar:
```json
{
  "success": true,
  "message": "Todo List Management REST API Service is Running",
  "documentation": "/api-docs",
  "environment": "development"
}
```

---

## 4. Penjelasan Semua Route / Endpoint

Base URL lokal: `http://localhost:3000/api`  
Base URL produksi: `https://todo-management-api.vercel.app/api`

### 4.1 Auth (Autentikasi)
Endpoint untuk proses login, registrasi, dan rotasi token pengguna.

| Method | Endpoint | Deskripsi | Butuh Auth? |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Daftar akun baru (`user` atau `admin`) | Tidak |
| `POST` | `/auth/login` | Masuk / login ke sistem (dapat Access + Refresh Token) | Tidak |
| `POST` | `/auth/refresh` | Perbarui Access Token menggunakan Refresh Token | Tidak |

#### Contoh Request — `POST http://localhost:3000/api/auth/register`
Header: `Content-Type: application/json`
```json
{
  "name": "Budi Santoso",
  "email": "budi@todoapp.id",
  "password": "User123!",
  "role": "user"
}
```
Contoh response BERHASIL (HTTP 201):
```json
{
  "success": true,
  "message": "Pengguna baru berhasil didaftarkan",
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

#### Contoh Request — `POST http://localhost:3000/api/auth/login`
```json
{
  "email": "budi@todoapp.id",
  "password": "User123!"
}
```
Contoh response BERHASIL (HTTP 200):
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": { "name": "Budi Santoso", "email": "budi@todoapp.id" },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4.2 Kategori (Categories) & Tugas (Todos)
Endpoint untuk mengelola kategori dan daftar tugas todo.

| Method | Endpoint | Deskripsi | Butuh Auth? |
| :--- | :--- | :--- | :--- |
| `POST` | `/categories` | Buat kategori baru (nama, deskripsi, warna hex) | Ya (token) |
| `GET` | `/categories` | Ambil semua daftar kategori milik user | Ya (token) |
| `GET` | `/categories/:id` | Ambil detail 1 kategori beserta daftar todo di dalamnya | Ya (token) |
| `PUT` | `/categories/:id` | Edit data kategori | Ya (token) |
| `DELETE`| `/categories/:id` | Hapus kategori (Soft Delete, otomatis arsipkan todo terkait) | Ya (token) |
| `POST` | `/todos` | Buat tugas baru | Ya (token) |
| `GET` | `/todos` | Ambil semua tugas (dukung filter `completed`, `priority`, pagination & search) | Ya (token) |
| `GET` | `/todos/:id` | Ambil rincian detail 1 tugas | Ya (token) |
| `PUT` | `/todos/:id` | Edit data tugas | Ya (token) |
| `DELETE`| `/todos/:id` | Hapus tugas (Soft Delete, `archived: true`) | Ya (token) |
| `DELETE`| `/todos/admin/all` | Arsipkan seluruh tugas aktif sekaligus | Ya (Khusus Admin) |

#### Format Pengiriman Token di Header Authorization
Untuk semua endpoint yang butuh login, tambahkan header:
`Authorization: Bearer <isi_dengan_accessToken_dari_login>`

### 4.3 Log Aktivitas Pengguna (Activity Logs)

| Method | Endpoint | Deskripsi | Butuh Auth? |
| :--- | :--- | :--- | :--- |
| `GET` | `/activity-logs` | Lihat riwayat aktivitas pengguna (`CREATE_TODO`, `UPDATE_TODO`, dll) | Ya (token) |

### 4.4 Statistik Eksternal Machine-to-Machine (Stats)
Endpoint khusus integrasi pihak ketiga yang dilindungi oleh API Key.

| Method | Endpoint | Deskripsi | Butuh Auth? |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats/summary` | Ringkasan statistik (total tugas, rasio selesai, prioritas) | `x-api-key` |
| `GET` | `/stats/activity-logs` | Log aktivitas pemantauan eksternal | `x-api-key` |

Format header:
`x-api-key: todo_api_m2m_key_safiq_prod_2026_v2`

---

## 5. Screenshot Pengujian Endpoint

Bagian ini menampilkan bukti pengujian setiap endpoint menggunakan **Postman Runner** dan **Swagger UI**.

### 5.1 Cara Menjalankan Pengujian di Postman
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** &rarr; masukkan file `docs/Postman_Collection.json` dan `docs/Postman_Environment.json`.
3. Pilih Environment **"Todo Management API - Local & Production"**.
4. Buka **Collection Runner**, pastikan seluruh 18 request terpilih, atur iterasi = 1, centang *Persist responses* dan *Keep variable values*, lalu klik **Start run**.

> [!NOTE]
> Seluruh bukti screenshot pengujian endpoint Postman Runner dan Swagger UI telah tertanam (*embedded*) secara utuh dan beresolusi tinggi di dalam dokumen resmi **[USER_MANUAL_BOOK.docx](./USER_MANUAL_BOOK.docx)**.

### 5.2 Pengujian Auth Endpoints
- **Test 1 — Register Pengguna Baru (Berhasil / HTTP 201 Created)**: Mengirim payload registrasi user, mengembalikan status 201 beserta user ID, Access Token, dan Refresh Token.
- **Test 2 — Login Pengguna (Berhasil / HTTP 200 OK dengan Auto-save Token)**: Mengirim kredensial email & password, mengembalikan status 200 dan menyimpan token ke variabel koleksi.
- **Test 3 — Refresh Token (Berhasil / HTTP 200 OK)**: Memperbarui Access Token yang kedaluwarsa dengan Refresh Token yang valid.

### 5.3 Pengujian Todo & Category Endpoints
- **Test 4 — Create Category & Get All Categories (Berhasil / HTTP 200 & 201)**: Membuat kategori baru dengan warna hex, mengambil semua kategori aktif pengguna.
- **Test 5 — Get Category by ID, Update Category, & Delete Category (Soft Delete)**: Mengambil detail kategori, update metadata, dan menghapus dengan mekanisme soft delete (`archived: true`).
- **Test 6 — Create Todo & Get Todos dengan Filtering, Sorting, Search, & Pagination**: Membuat tugas baru (otomatis catat `CREATE_TODO`), mengambil daftar tugas dengan query parameters lengkap.
- **Test 7 — Search Todos by Keyword & Get Todo Detail**: Pencarian tugas berbasis kata kunci judul dan deskripsi.

### 5.4 Pengujian Soft Delete, Admin Archive All, Activity Logs, & M2M Stats
- **Test 8 — Update Todo & Delete Todo (Soft Delete / `archived: true`)**: Mengubah status tugas menjadi selesai (catat `UPDATE_TODO`), dan soft delete tugas (catat `DELETE_TODO`).
- **Test 9 — Admin Archive All Active Todos (`DELETE /api/todos/admin/all`)**: Pengujian RBAC admin untuk mengarsipkan semua tugas aktif.
- **Test 10 — Get User Activity Logs (`GET /api/activity-logs`)**: Riwayat audit log pengguna secara berurutan.
- **Test 11 — Machine-to-Machine Summary Stats (`x-api-key`)**: Endpoint agregasi statistik untuk integrasi sistem eksternal.
- **Test 12 — External Activity Logs Monitoring (`x-api-key`)**: Pemantauan log aktivitas eksternal via API Key.

### 5.5 Pengujian Dokumentasi Interaktif Swagger UI
Dokumentasi interaktif OpenAPI 3.0 dapat diakses langsung pada URL `/api-docs` (baik di server lokal `http://localhost:3000/api-docs` maupun live deployment Vercel `https://todo-management-api.vercel.app/api-docs`).

### 5.6 Otorisasi & Eksekusi Swagger UI
Swagger UI mendukung autentikasi interaktif:
1. Klik tombol **Authorize** di pojok kanan atas.
2. Masukkan Access Token JWT pada skema `bearerAuth` (`Bearer <token>`).
3. Masukkan kunci API eksternal pada skema `apiKeyAuth` (`x-api-key`).
4. Uji endpoint secara langsung menggunakan tombol **"Try it out"** dan **"Execute"** (Respon HTTP 200 OK).

---

## 6. Simulasi Kasus Gagal & Error

Bagian ini membuktikan bahwa proyek telah menangani berbagai kondisi error dengan respons standar JSON dan kode status HTTP yang akurat.

### 6.1 Daftar Kode Error HTTP
- **`200 OK`**: Request berhasil diproses.
- **`201 Created`**: Data baru berhasil disimpan.
- **`400 Bad Request`**: Format request salah atau malformed JSON.
- **`401 Unauthorized`**: Belum login, token tidak disertakan, atau kunci API salah.
- **`403 Forbidden`**: Sudah login tetapi hak akses tidak mencukupi (misal: user biasa mengakses rute admin).
- **`404 Not Found`**: ID data atau route URL tidak ditemukan.
- **`409 Conflict`**: Email sudah terdaftar di sistem.
- **`422 Unprocessable Entity`**: Validasi data input gagal (misal: judul tugas kosong).
- **`429 Too Many Requests`**: Melebihi batas kuota request (Rate Limiting).
- **`500 Server Error`**: Terjadi kesalahan internal pada server.

### 6.2 Simulasi Error — Register Email Duplikat (HTTP 409)
Kondisi: Mencoba register dengan email yang sudah ada di database (`budi@todoapp.id`).
Response:
```json
{
  "success": false,
  "message": "Alamat email tersebut sudah terdaftar di sistem"
}
```

### 6.3 Simulasi Error — Login Password Salah (HTTP 401)
Kondisi: Mengirim password yang salah saat login.
Response:
```json
{
  "success": false,
  "message": "Kredensial login tidak valid, periksa email dan kata sandi Anda"
}
```

### 6.4 Simulasi Error — Akses Tanpa Token (HTTP 401)
Kondisi: Mengakses endpoint `/api/todos` tanpa header `Authorization`.
Response:
```json
{
  "success": false,
  "message": "Akses ditolak: Anda belum login atau token autentikasi tidak disertakan"
}
```

### 6.5 Simulasi Error — Hak Akses Tidak Cukup / RBAC (HTTP 403)
Kondisi: User biasa memanggil endpoint admin `DELETE /api/todos/admin/all`.
Response:
```json
{
  "success": false,
  "message": "Akses terlarang: Anda tidak memiliki izin hak akses untuk melakukan tindakan ini"
}
```

### 6.6 Simulasi Error — Data Tidak Ditemukan (HTTP 404)
Kondisi: Mencari todo dengan ID acak yang tidak ada di database.
Response:
```json
{
  "success": false,
  "message": "Tugas tidak ditemukan atau Anda tidak memiliki akses"
}
```

### 6.7 Simulasi Error — Validasi Input Gagal (HTTP 422)
Kondisi: Mengirim request `POST /api/todos` dengan field `title` kosong.
Response:
```json
{
  "success": false,
  "message": "Validasi input gagal",
  "errors": [
    { "field": "title", "message": "Judul tugas (title) wajib diisi" }
  ]
}
```

*(Hasil eksekusi automated test skenario error handling dan validasi input secara detail terlampir pada dokumen resmi USER_MANUAL_BOOK.docx)*

### 6.8 Ringkasan Tabel Simulasi Error

| Kode HTTP | Pesan Error | Penyebab & Solusi |
| :--- | :--- | :--- |
| **400 Bad Request** | Format request tidak valid | Periksa format JSON body yang dikirim |
| **401 Unauthorized** | Token tidak ditemukan / tidak valid | Lakukan login dulu, lalu salin token ke header Authorization |
| **403 Forbidden** | Hak akses tidak cukup | Gunakan akun yang memiliki peran admin |
| **404 Not Found** | Data atau URL tidak ditemukan | Pastikan ID resource benar dan path URL sudah tepat |
| **409 Conflict** | Email sudah terdaftar | Gunakan alamat email yang berbeda saat registrasi |
| **422 Unprocessable** | Validasi data gagal | Periksa pesan error untuk mengetahui field wajib yang belum diisi |
| **500 Server Error** | Kesalahan internal server | Periksa console log terminal untuk menelusuri bug |

---

## 7. Penutup & Catatan Tambahan

### 7.1 Kesimpulan
Dokumen User Manual Book ini telah menjelaskan secara komprehensif cara menggunakan proyek backend **Todo List Management REST API**, mulai dari:
1. Instalasi dan konfigurasi awal (`npm install`, `.env`, koneksi MongoDB Atlas, seeding).
2. Struktur folder dan fungsi setiap layer arsitektur (Controller-Service-Model).
3. Cara menjalankan server secara lokal maupun di serverless cloud Vercel.
4. Penjelasan seluruh endpoint API (Auth, Categories, Todos, Activity Logs, Stats).
5. Bukti pengujian manual menggunakan Postman dan Swagger UI.
6. Penanganan kasus error dan pengujian otomatis (29 unit & integration tests lolos).

### 7.2 Perintah-Perintah Penting (Cheat Sheet)

```powershell
# ─── SETUP AWAL ───────────────────────────────
git clone https://github.com/safiqandinuralamsyah/todo-management-api.git
cd todo-management-api
npm install

# ─── BASIS DATA & SEEDER ─────────────────────
npm run seed          # Mengisi database dengan akun admin, user, & todo contoh

# ─── MENJALANKAN SERVER ───────────────────────
npm run dev           # Mode development (auto-restart nodemon di port 3000)
npm start             # Mode production

# ─── PENGUJIAN OTOMATIS (TESTING) ─────────────
npm test              # Menjalankan 29 automated tests Jest & Supertest

# ─── UTILITAS ─────────────────────────────────
node -v               # Memeriksa versi Node.js
npm -v                # Memeriksa versi npm
```

### 7.3 Catatan dari Pembuat
Proyek backend ini saya selesaikan sebagai tugas akhir praktik kejuruan dan portofolio mandiri. Dalam proses pengembangannya, saya mempraktikkan konsep **Clean Architecture**, keamanan autentikasi ganda dengan JWT (Access & Refresh Token), otorisasi berbasis peran (RBAC), mekanisme Soft Delete untuk menjaga integritas data, serta pengujian otomatis berbasis Jest.

Semoga dokumentasi ini mempermudah pengujian dan pengembangan sistem lebih lanjut!

### 7.4 Referensi
- Dokumentasi resmi Node.js: [https://nodejs.org/docs](https://nodejs.org/docs)
- Dokumentasi Express.js: [https://expressjs.com](https://expressjs.com)
- Dokumentasi Mongoose: [https://mongoosejs.com](https://mongoosejs.com)
- Dokumentasi Swagger OpenAPI 3.0: [https://swagger.io/specification/](https://swagger.io/specification/)
- Repositori GitHub Proyek: [https://github.com/safiqandinuralamsyah/todo-management-api](https://github.com/safiqandinuralamsyah/todo-management-api)

---
*Dokumen ini dibuat dengan sepenuh hati untuk keperluan tugas dan pendidikan.*  
**Safiq Andi Nur Alamsyah — SMK / Sekolah — 2026**
