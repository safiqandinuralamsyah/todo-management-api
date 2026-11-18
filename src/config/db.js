const mongoose = require("mongoose");
const dns = require("dns");

// Resolusi DNS publik untuk menjamin koneksi MongoDB Atlas (+srv) tidak terblokir di lingkungan lokal
try {
  if (!process.env.VERCEL) {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  }
} catch (e) {
  // Abaikan jika sistem operasi membatasi pengaturan DNS
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("Peringatan: MONGODB_URI belum dikonfigurasi pada environment variables.");
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Jangan pernah memanggil process.exit(1) pada runtime serverless (Vercel)
    if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
