# MANUAL BOOK TEKNIS BACKEND API
## Sistem Manajemen Todo List (Production-Ready)

---

## 1. Arsitektur Sistem
API Backend ini dikembangkan menggunakan **Node.js** dan framework **Express.js** dengan struktur arsitektur **Controller-Service-Model**:

```text
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│  Client / HTTP  │ ────> │  Routes & Middlewares  │ ────> │     Controllers      │
│  (Web / App /   │ <──── │  (JWT, RBAC, Val, Lim) │ <──── │ (Status & Respon JSON)│
│   Machine M2M)  │       └────────────────────────┘       └──────────┬───────────┘
└─────────────────┘                                                   │
                                                                      ▼
┌─────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│ Database Mongo  │ <───> │     Mongoose Model     │ <───> │       Services       │
│  (Collections)  │       │  (Schema, Hooks, Idx)  │       │  (Logika Bisnis API) │
└─────────────────┘       └────────────────────────┘       └──────────────────────┘
```

1. **Routes & Middlewares**: Menerima request HTTP, melakukan validasi sanitasi skema (`express-validator`), memverifikasi token JWT (`auth.middleware`), memeriksa hak akses peran (`restrictTo`), dan membatasi traffic (`rateLimiter`).
2. **Controllers**: Bertanggung jawab menerima parameter request HTTP, memanggil business logic pada services, dan mengembalikan format respon JSON yang konsisten.
3. **Services**: Mengisolasi seluruh proses bisnis murni, kalkulasi query data, relasi antar dokumen, serta pencatatan audit log aktivitas.
4. **Models**: Mendefinisikan kontrak skema dokumen Mongoose, relasi `ObjectId ref`, autoIndex, dan hook pre-save enkripsi password.

---

## 2. Desain 4 Skema Database & Relasi Dokumen

### 2.1 Relasi Antar Dokumen
- Satu `User` dapat memiliki banyak `Category` (`owner: User._id`).
- Satu `Category` dapat memiliki banyak `Todo` (`category: Category._id`).
- Setiap `Todo` terikat pada `User` pemiliknya (`owner: User._id`) dan `Category`.
- Setiap mutasi pada `Todo` maupun `Category` mencatat dokumen baru pada `ActivityLog`.

### 2.2 Aturan Kualitas Wajib (Global Schema Fields)
Semua koleksi memiliki 5 field audit berikut:
- `created_by` (ObjectId ref User): ID user yang membuat data awal.
- `updated_by` (ObjectId ref User): ID user yang terakhir kali mengubah data.
- `archived` (Boolean, default false): Penanda soft delete data.
- `created_at` & `updated_at`: Waktu pencatatan otomatis via `{ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }`.

---

## 3. Alur Autentikasi & Otorisasi Berbasis Peran (RBAC)

```text
               Kredensial Email & Password
Pengguna ───────────────────────────────────────────> [POST /api/auth/login]
                                                              │
                                                        Kredensial Valid?
                                                        ├──── TIDAK ───> 401 Unauthorized
                                                        ▼ YA
                                            Terbitkan:
                                            - Access Token (1 hari)
                                            - Refresh Token (7 hari)
                                                              │
                                                              ▼
               Kirim Header: Authorization: Bearer <Token>
Pengguna ───────────────────────────────────────────> [Protected Endpoints]
                                                              │
                                                        Verifikasi JWT &
                                                        Status User Aktif?
                                                        ├──── TIDAK ───> 401 Unauthorized
                                                        ▼ YA
                                                    Pemeriksaan RBAC
                                                (Role: user vs admin)
                                                        ├──── GAGAL ───> 403 Forbidden
                                                        ▼ LULUS
                                                Akses Diberikan (200 / 201)
```

---

## 4. Contoh Payload Request & Response JSON

### 4.1 Registrasi Pengguna
- **Method & URL**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@todoapp.id",
    "password": "User123!",
    "role": "user"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Pengguna baru berhasil didaftarkan",
    "data": {
      "user": {
        "_id": "67396a84f1837b29a14d5671",
        "name": "Budi Santoso",
        "email": "budi@todoapp.id",
        "role": "user",
        "archived": false,
        "created_by": "67396a84f1837b29a14d5671",
        "updated_by": "67396a84f1837b29a14d5671",
        "created_at": "2026-11-17T08:00:00.000Z",
        "updated_at": "2026-11-17T08:00:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 4.2 Login Pengguna
- **Method & URL**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "budi@todoapp.id",
    "password": "User123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login berhasil, selamat datang kembali",
    "data": {
      "user": {
        "_id": "67396a84f1837b29a14d5671",
        "name": "Budi Santoso",
        "email": "budi@todoapp.id",
        "role": "user"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 4.3 Pembuatan Tugas Baru
- **Method & URL**: `POST /api/todos`
- **Header**: `Authorization: Bearer <accessToken>`
- **Request Body**:
  ```json
  {
    "title": "Menyusun Laporan Keuangan Q4",
    "description": "Rekapitulasi laba rugi akhir tahun",
    "priority": "high",
    "dueDate": "2026-12-31T23:59:59.000Z",
    "category": "67396a84f1837b29a14d5675"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Tugas baru berhasil dibuat",
    "data": {
      "_id": "67396a84f1837b29a14d5680",
      "title": "Menyusun Laporan Keuangan Q4",
      "description": "Rekapitulasi laba rugi akhir tahun",
      "completed": false,
      "priority": "high",
      "dueDate": "2026-12-31T23:59:59.000Z",
      "category": {
        "_id": "67396a84f1837b29a14d5675",
        "name": "Pekerjaan & Proyek Kantor",
        "color": "#2563EB"
      },
      "owner": {
        "_id": "67396a84f1837b29a14d5671",
        "name": "Budi Santoso",
        "email": "budi@todoapp.id"
      },
      "archived": false,
      "created_by": "67396a84f1837b29a14d5671",
      "updated_by": "67396a84f1837b29a14d5671",
      "created_at": "2026-11-17T08:15:00.000Z",
      "updated_at": "2026-11-17T08:15:00.000Z"
    }
  }
  ```

### 4.4 Mengambil Daftar Tugas (Filtering & Pagination)
- **Method & URL**: `GET /api/todos?page=1&limit=10&completed=false&priority=high&search=Laporan&sortBy=dueDate&order=asc`
- **Header**: `Authorization: Bearer <accessToken>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Berhasil mengambil daftar tugas",
    "data": [
      {
        "_id": "67396a84f1837b29a14d5680",
        "title": "Menyusun Laporan Keuangan Q4",
        "completed": false,
        "priority": "high",
        "dueDate": "2026-12-31T23:59:59.000Z",
        "category": {
          "_id": "67396a84f1837b29a14d5675",
          "name": "Pekerjaan & Proyek Kantor",
          "color": "#2563EB"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10
    }
  }
  ```

### 4.5 Statistik Ringkasan Eksternal (Machine-to-Machine)
- **Method & URL**: `GET /api/stats/summary`
- **Header**: `x-api-key: <YOUR_EXTERNAL_API_KEY>`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Berhasil mengambil ringkasan statistik sistem",
    "data": {
      "overview": {
        "totalTodos": 9,
        "completedTodos": 3,
        "pendingTodos": 6,
        "totalCategories": 3,
        "completionRate": "33.3%"
      },
      "todosPerCategory": [
        {
          "_id": "67396a84f1837b29a14d5675",
          "categoryName": "Pekerjaan & Proyek Kantor",
          "categoryColor": "#2563EB",
          "todoCount": 3,
          "completedCount": 1,
          "pendingCount": 2
        }
      ]
    }
  }
  ```

---

## 5. Standar Format Error Response

Jika terjadi kesalahan input atau kegagalan sistem, API mengembalikan format JSON standar:
```json
{
  "success": false,
  "message": "Validasi input gagal",
  "errors": [
    {
      "field": "title",
      "message": "Judul tugas (title) wajib diisi"
    }
  ]
}
```

Daftar Kode Status HTTP Utama:
- `200 OK`: Sukses GET, PUT, DELETE (soft-delete).
- `201 Created`: Sukses POST registrasi, pembuatan kategori, dan pembuatan tugas.
- `400 Bad Request`: Parameter ID tidak valid (CastError).
- `401 Unauthorized`: Token JWT atau header `x-api-key` tidak valid / hilang.
- `403 Forbidden`: Akses ditolak karena role user tidak memadai.
- `404 Not Found`: Dokumen tidak ditemukan atau berstatus `archived: true`.
- `409 Conflict`: Alamat email sudah terdaftar.
- `422 Unprocessable Entity`: Gagal validasi input skema request.
- `429 Too Many Requests`: Batas akses rate limit terlampaui.
- `500 Internal Server Error`: Kesalahan server tak terduga.
