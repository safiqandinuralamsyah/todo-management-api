const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Judul tugas (title) wajib diisi"],
      trim: true,
      minlength: [1, "Judul tugas minimal terdiri dari 1 karakter"],
      maxlength: [200, "Judul tugas maksimal terdiri dari 200 karakter"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    completed: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Prioritas harus berupa 'low', 'medium', atau 'high'"
      },
      default: "medium"
    },
    dueDate: {
      type: Date,
      default: null
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Kategori tugas (category) wajib disertakan"]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pemilik tugas (owner) wajib disertakan"]
    },
    archived: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pembuat tugas (created_by) wajib disertakan"]
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pembaruan tugas (updated_by) wajib disertakan"]
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

todoSchema.index({ owner: 1, archived: 1, completed: 1, priority: 1, dueDate: 1 });
todoSchema.index({ title: "text", description: "text" });

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
