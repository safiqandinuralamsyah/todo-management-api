require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const Todo = require("../models/todo.model");
const ActivityLog = require("../models/activityLog.model");

const seedData = async () => {
  try {
    await connectDB();
    console.log("Membersihkan data lama dari database...");

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Todo.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    console.log("Menyiapkan akun pengguna (Admin & User)...");

    // 1. Akun Admin & Regular User
    const adminUser = new User({
      name: "Super Administrator",
      email: "admin@todoapp.id",
      password: "Admin123!",
      role: "admin",
      archived: false
    });
    await adminUser.save();
    adminUser.created_by = adminUser._id;
    adminUser.updated_by = adminUser._id;
    await adminUser.save({ validateBeforeSave: false });

    const regularUser = new User({
      name: "Budi Santoso",
      email: "budi@todoapp.id",
      password: "User123!",
      role: "user",
      archived: false
    });
    await regularUser.save();
    regularUser.created_by = regularUser._id;
    regularUser.updated_by = regularUser._id;
    await regularUser.save({ validateBeforeSave: false });

    console.log("Membuat 3 kategori realistis...");

    // 2. Kategori untuk regularUser
    const categoriesData = [
      {
        name: "Pekerjaan & Proyek Kantor",
        description: "Manajemen tugas sprint, evaluasi proyek klien, dan laporan manajerial kantor",
        color: "#2563EB", // Blue
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        name: "Akademik & Pengembangan Diri",
        description: "Kursus sertifikasi cloud, riset literatur, dan persiapan ujian teknis",
        color: "#16A34A", // Green
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        name: "Kesehatan & Rutinitas Harian",
        description: "Jadwal olahraga kardio, pola istirahat, dan medical check-up berkala",
        color: "#DC2626", // Red
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      }
    ];

    const insertedCategories = await Category.insertMany(categoriesData);

    // Activity log untuk kategori
    for (const cat of insertedCategories) {
      await ActivityLog.create({
        action: "CREATE_CATEGORY",
        categoryId: cat._id,
        userId: regularUser._id,
        details: `Membuat kategori seeder: "${cat.name}"`,
        metadata: { name: cat.name, color: cat.color },
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      });
    }

    console.log("Membuat 9+ todo realistis dengan variasi status & prioritas...");

    // 3. Minimal 3 todo untuk masing-masing 3 kategori (total 9 todo)
    const todosData = [
      // Kategori 1: Pekerjaan & Proyek Kantor
      {
        title: "Menyelesaikan Dokumentasi Arsitektur API V2",
        description: "Menulis manual book dan OpenAPI 3.0 specification untuk integrasi tim mobile",
        completed: true,
        priority: "high",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        category: insertedCategories[0]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        title: "Code Review Pull Request Gateway Pembayaran",
        description: "Audit implementasi webhook idempotent dan enkripsi payload transaksi",
        completed: false,
        priority: "high",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        category: insertedCategories[0]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        title: "Evaluasi Hasil Sprint Retro 42",
        description: "Mendata bottleneck deployment pipeline dan action item tim devops",
        completed: false,
        priority: "medium",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        category: insertedCategories[0]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },

      // Kategori 2: Akademik & Pengembangan Diri
      {
        title: "Menyelesaikan Modul AWS Solutions Architect",
        description: "Mempelajari arsitektur multi-region resilient dan autoscaling DynamoDB",
        completed: true,
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: insertedCategories[1]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        title: "Latihan Soal Ujian Sertifikasi Kubernetes (CKA)",
        description: "Simulasi setup network policy dan troubleshooting crashing pods",
        completed: false,
        priority: "high",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        category: insertedCategories[1]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        title: "Membaca Buku 'Designing Data-Intensive Applications' Bab 7",
        description: "Memahami isolasi transaksi database (serializable vs snapshot isolation)",
        completed: false,
        priority: "low",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        category: insertedCategories[1]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },

      // Kategori 3: Kesehatan & Rutinitas Harian
      {
        title: "Lari Pagi 5 KM di Gelora Bung Karno",
        description: "Target pace 6.00 menit/km untuk menjaga kesehatan kardiovaskular",
        completed: true,
        priority: "medium",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        category: insertedCategories[2]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        title: "Konsultasi Dokter & Medical Check-Up Tahunan",
        description: "Pemeriksaan profil lipid darah lengkap, tensi, dan gula darah puasa",
        completed: false,
        priority: "high",
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        category: insertedCategories[2]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      },
      {
        title: "Membeli Suplemen Vitamin D3 & Omega 3",
        description: "Restock kebutuhan vitamin mingguan di apotek terdekat",
        completed: false,
        priority: "low",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        category: insertedCategories[2]._id,
        owner: regularUser._id,
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      }
    ];

    const insertedTodos = await Todo.insertMany(todosData);

    // 4. Activity Logs untuk masing-masing todo
    for (const todo of insertedTodos) {
      await ActivityLog.create({
        action: "CREATE_TODO",
        todoId: todo._id,
        categoryId: todo.category,
        userId: regularUser._id,
        details: `Membuat tugas seeder: "${todo.title}"`,
        metadata: {
          title: todo.title,
          priority: todo.priority,
          completed: todo.completed
        },
        created_by: regularUser._id,
        updated_by: regularUser._id,
        archived: false
      });
    }

    console.log("===================================================");
    console.log("Seeding data berhasil diselesaikan!");
    console.log("Akun Admin : admin@todoapp.id / Admin123!");
    console.log("Akun User  : budi@todoapp.id / User123!");
    console.log(`Kategori   : ${insertedCategories.length} kategori dibuat`);
    console.log(`Tugas/Todo : ${insertedTodos.length} tugas dibuat`);
    console.log("===================================================");

    if (process.env.NODE_ENV !== "test") {
      process.exit(0);
    }
  } catch (error) {
    console.error("Gagal melakukan seeding data:", error);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
