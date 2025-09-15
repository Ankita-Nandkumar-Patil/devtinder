require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")
const connectDB = require("./config/database");
const app = express();

app.use(express.json())  //middleware to fetch dynamic data
app.use(cookieParser());

// importing the apis from routes
const authRouter = require("./apiRoutes/auth")
const profileRouter = require("./apiRoutes/profile");
const requestRouter = require("./apiRoutes/request");
const userRouter = require("./apiRoutes/user");

// let the app use our apis
app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", requestRouter)
app.use("/", userRouter)


connectDB()
  .then(() => {
    console.log("DB connection established successfully");
    app.listen(3000, () => {
      console.log("app listening on port 3000");
    });
  })
  .catch((err) => {
    console.error("error connecting to DB : ", err);
  });
