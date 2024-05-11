const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require( "./db/index.js");
const cors = require("cors")
const userRouter = require("./routes/user.routes");
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
<<<<<<< HEAD:backend/App.js
.then(()=>{
    app.listen(process.env.PORT || 3000 , ()=>{
        console.log(`App is listening on Port ${process.env.PORT}`);
        console.log("hello world")
    })
})
.catch((err)=>{
=======
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App is listening on Port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
>>>>>>> 6f74d5c1908bae23336be30e42076934431a7ced:backend/src/App.js
    console.log("ERROR IN CONNECTION || CONNECTION FAILED", err);
  });
