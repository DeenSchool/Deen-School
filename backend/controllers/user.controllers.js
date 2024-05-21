const User = require("../models/user.model");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { signToken } = require("./auth.controllers");
const sendEmail = require("../utils/email");

const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedfields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    data: { users },
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.role === "admin") {
    return next(new AppError("You are not supposed to signup as Admin", 400));
  }

  const userData = { ...req.body, verified: false };
  const userExists = await User.findOne({ email: req.body.email });

  if (userExists) {
    return res.status(401).json({
      status: "fail",
      message: "User already exists with this email",
    });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  userData.otp = otpHash;
  userData.otpExpiry = Date.now() + 10 * 60 * 1000;

  await User.create(userData);

  const message = `Your one-time registration code is "${otp}". It is valid for 10 minutes.`;
  await sendEmail({
    email: req.body.email,
    subject: "Your OTP is valid for 10 minutes",
    message,
  });

  res.status(201).json({
    status: "success",
    message: "OTP sent successfully",
  });
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  user.otp = otpHash;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;

  await user.save({validateModifiedOnly:true});

  const message = `Your one-time registration code is "${otp}". It is valid for 10 minutes.`;
  await sendEmail({
    email: req.body.email,
    subject: "Your OTP is valid for 10 minutes",
    message,
  });

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
  });
});


exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiry');

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedOtp !== user.otp || user.otpExpiry < Date.now()) {
    return next(new AppError("OTP is invalid or has expired", 400));
  }

  user.verified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({validateModifiedOnly:true});

  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(201).json({
    status: "success",
    token,
    data: { user },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use updatePassword.", 400));
  }

  const filteredBody = filterObj(req.body, "firstName", "lastName", "email", "address", "phoneNumber", "photo");

  if (req.file) {
    filteredBody.photo = req.file.path;
  }

  if (req.user.photo && req.file) {
    try {
      await unlinkAsync(req.user.photo);
    } catch (err) {
      console.error(`No photo found`);
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.user.role === "user") {
    await User.findByIdAndUpdate(req.user.id, { active: false });
  } else if (req.user.role === "admin") {
    await User.findByIdAndUpdate(req.params.id, { active: false });
  }
  res.status(204).json({ status: "success", data: null });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  if (!user.verified){
    return next(new AppError("Please verify your account first", 401));
  }

  const token = signToken(user._id);
  res.status(200).json({ status: "success", token });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() - 10 * 1000), 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
  });
  res.status(200).json({ status: "success" });
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}/api/user/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and password confirmation to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email. Try again later!", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(201).json({ status: "success", token });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  console.log(req.body);

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Incorrect password", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({ status: "success", token });
});
