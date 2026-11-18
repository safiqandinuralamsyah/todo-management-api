const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Aksi aktivitas (action) wajib disertakan"],
      enum: {
        values: [
          "CREATE_TODO",
          "UPDATE_TODO",
          "DELETE_TODO",
          "CREATE_CATEGORY",
          "UPDATE_CATEGORY",
          "DELETE_CATEGORY"
        ],
        message: "Aksi aktivitas tidak valid"
      }
    },
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Todo",
      default: null
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID pengguna pelaku (userId) wajib disertakan"]
    },
    details: {
      type: String,
      required: [true, "Rincian aktivitas (details) wajib diisi"],
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    archived: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pembuat log (created_by) wajib disertakan"]
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pembaruan log (updated_by) wajib disertakan"]
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

activityLogSchema.index({ userId: 1, action: 1, created_at: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
