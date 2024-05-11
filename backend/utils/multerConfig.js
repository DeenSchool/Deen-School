const multer = require("multer");

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/user-images");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `user-${uniqueSuffix}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  console.log(req.body);

  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images"), false);
  }
};

const uploadUser = multer({
  storage: userStorage,
  fileFilter: multerFilter,
});


exports.uploadUserPhotos = uploadUser.single("photo");

