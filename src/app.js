require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")
const connectDB = require("./config/database");
const app = express();
const cors = require("cors")

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))  //middleware to tackle CORS errors
app.use(express.json())  //middleware to fetch dynamic data
app.use(cookieParser());

// importing the apis from routes
const authRouter = require("./apiRoutes/auth")
const profileRouter = require("./apiRoutes/profile");
const userRouter = require("./apiRoutes/user")
const requestRouter = require("./apiRoutes/request")

// let the app use our apis
app.use("/", authRouter)
app.use("/", profileRouter)
app.use("/", userRouter)
app.use("/", requestRouter)


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
