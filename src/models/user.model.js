const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama pengguna wajib diisi"],
      trim: true,
      minlength: [2, "Nama minimal terdiri dari 2 karakter"],
      maxlength: [100, "Nama maksimal terdiri dari 100 karakter"]
    },
    email: {
      type: String,
      required: [true, "Email wajib diisi"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Format alamat email tidak valid"
      ]
    },
    password: {
      type: String,
      required: [true, "Kata sandi wajib diisi"],
      minlength: [6, "Kata sandi minimal terdiri dari 6 karakter"],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Peran harus berupa 'user' atau 'admin'"
      },
      default: "user"
    },
    refreshToken: {
      type: String,
      default: null,
      select: false
    },
    archived: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
