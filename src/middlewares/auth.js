require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }

    const decodedObj = await jwt.verify(token, process.env.JWT_SECRETE);
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found")
    }

    // attaching user to req body so we can access it in other api calls
    req.user = user;
    next()
  } catch (error) {
    res.status(400).send("Error" + error.message);
  }
};


module.exports = { userAuth }
