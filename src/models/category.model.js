const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama kategori wajib diisi"],
      trim: true,
      minlength: [2, "Nama kategori minimal terdiri dari 2 karakter"],
      maxlength: [100, "Nama kategori maksimal terdiri dari 100 karakter"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    color: {
      type: String,
      trim: true,
      default: "#3B82F6",
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Format warna harus kode heksadesimal yang valid"]
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pemilik kategori wajib disertakan"]
    },
    archived: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pembuat kategori (created_by) wajib disertakan"]
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pembaruan kategori (updated_by) wajib disertakan"]
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

categorySchema.index({ owner: 1, archived: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
