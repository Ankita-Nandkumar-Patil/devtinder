require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please login !");
    }

    const decodedObj = jwt.verify(token, process.env.JWT_SECRETE); // no need for await
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).send("User not found");
    }

    // attach user to req
    req.user = user;
    return next();
  } catch (error) {
    return res.status(400).send("Error: " + error.message);
  }
};

module.exports = { userAuth };
