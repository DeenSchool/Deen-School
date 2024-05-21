const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require( "./db/index.js");
const cors = require("cors")
const userRouter = require("./routes/user.routes.js");
const globalErrorHandler = require("./controllers/error.controller");
dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());

// Middlewares
app.use(express.json());
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

ConnectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is listening on Port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("ERROR IN CONNECTION || CONNECTION FAILED", err);
  });
