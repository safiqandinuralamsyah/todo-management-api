const express = require("express");
const logger = require("./middlewares/logger.middleware");
const notFoundHandler = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");
const { generalLimiter } = require("./middlewares/rateLimiter.middleware");
const { setupSwagger } = require("./config/swagger");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const todoRoutes = require("./routes/todo.routes");
const activityLogRoutes = require("./routes/activityLog.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();

// Parsing JSON dan URL-encoded request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
app.use(logger);

// Swagger Documentation UI
setupSwagger(app);

// Root Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Todo List Management REST API Service is Running",
    documentation: "/api-docs",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// General Rate Limiter untuk seluruh rute /api
app.use("/api", generalLimiter);

// Endpoint Resources
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/stats", statsRoutes);

// 404 Handler untuk endpoint yang tidak terdaftar
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
