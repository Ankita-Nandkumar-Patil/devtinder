const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

require("dotenv").config();


const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 2,
  },
  lastName: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  age: {
    type: String
  },
  city: {
    type: String,
  },
  gender: {
    type: String,
  },
  emailID: {
    type: String,
    required: true, 
    unique: true,
    trim: true,
  },
  skills: {
    type: [String]
  },
  about: {
    type: String,
    default: "contains some info about you !"
  }

});


UserSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRETE, { expiresIn: '7d' });

  return token;
};


UserSchema.methods.validatePassword = async function (userInputPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(userInputPassword, passwordHash);

  return isPasswordValid;
}

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel; 