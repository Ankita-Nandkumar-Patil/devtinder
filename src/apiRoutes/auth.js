const express = require("express")
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const validator = require("validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");


authRouter.post("/signup", async (req, res) => {
  try {
    // validate data
    validateSignupData(req);

    // encrypt the password
    const { firstName, lastName, emailID,password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10) //(password, saltRounds)

    console.log(passwordHash)
    // creating new instance of user model
    const user = new User({
      firstName, lastName, emailID, password : passwordHash
    });
    await user.save();
    res.send("user saved successfully")
  }
  catch (error) {
    res.status(400).send("Error: " + error.message)
  }
})

authRouter.post("/login", async (req, res) => {
  try {
    const { emailID, password } = req.body;
    const user = await User.findOne({emailID : emailID})
    if (!validator.isEmail(emailID)) {
      throw new Error("enter a valid email")
    } else if (!user) {
      throw new Error("user with this emailD not found")
    } else { 
      const isPasswordValid = await user.validatePassword(password);

      if (isPasswordValid) {
        // Create JWT token
        const token = await user.getJWT();
        //(secret to store in token, secret key which only the server knows)

        // add token to COOKIE
        res.cookie("token", token)
        res.send("Login successfully!")
      } else {
        throw new Error("Incorrect password, please try again")
      }
    }
  } catch (error) {
    res.status(400).send("Error: "+ error.message)
  }
})


authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {   //we are setting cookie to null and expiring it at the current date.now()
    expiresIn: new Date(Date.now())
  })
  res.send("successfully logged out! ")
})
module.exports= authRouter