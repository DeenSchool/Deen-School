const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

const usersSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required']
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  phoneNumber: {
    type: String,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: {
    type: Date,
    select: false,
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

usersSchema.pre("save", async function (next) {
  // Only run this function if password is modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 10
  this.password = await bcrypt.hash(this.password, 10);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

usersSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

usersSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

usersSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

usersSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimestamp;
  }
  // False means not changed
  return false;
};

usersSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

usersSchema.methods.correctPassword = async function (
  candidatePassword,
  userpassword
) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

usersSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

const User = mongoose.model("User", usersSchema);
module.exports = User;
