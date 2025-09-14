const express = require("express")
const authRouter = express.Router();
const { validateSignupData } = require("../utils/validation");
const validator = require("validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto")


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
    res.status(400).send("Error: " + error.message)
  }
})

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {   //we are setting cookie to null and expiring it at the current date.now()
    expiresIn: new Date(Date.now())
  })
  res.send("successfully logged out! ")
})

// forgot password


// phase -1 :: Request phase: sending resetUrl to user
// user submit its email -> we generate token -> save it -> send link
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { emailID } = req.body;
    const user = await User.findOne({emailID})
    if (!user) {
      return res.send("if that email exists, a reset link was sent to it!")
    }

    // generate a secure randon token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // hash the token before saving to db : more secure
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 *60 *1000 //adding expiry of 15 minutes
    await user.save()

    // build reset link
    const resetURL = `http://localhost:3000/reset-password/${resetToken}`

    // send reseturl via mail, currently just logging to console
    console.log("reset password link: ", resetURL)

    res.send("password reset link has been sent to your email")
  } catch (error) {
    res.status(400).send("Error : " + error.message)
  }
})



// phase - 2 :: Reset phase: ehre we will verify token and update password
//  user clicks link -> sends new password -> verify token -> update password

authRouter.post("/reset-password/:token", async (req, res) => {
  try {
    const resetToken = req.params.token;

    // hash it again to compare with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    // find user with valid token which is not yet expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error("Invalid or expired token")
    }

    // encrypt new password
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save()

    res.send("Password has been reset successfully")
  } catch (error) {
    res.status(400).send("Error: " + error.message)
  }
})


module.exports= authRouter