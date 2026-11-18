require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Mematikan server...", err.name, err.message);
  process.exit(1);
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`Server aktif pada mode : ${process.env.NODE_ENV || "development"}`);
    console.log(`Port                   : ${PORT}`);
    console.log(`URL Server             : http://localhost:${PORT}`);
    console.log(`Dokumentasi Swagger    : http://localhost:${PORT}/api-docs`);
    console.log(`===================================================`);
  });

  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! Mematikan server...", err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
});
