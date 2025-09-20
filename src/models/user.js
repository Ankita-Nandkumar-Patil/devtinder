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
  emailID: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  city: {
    type: String,
  },
  gender: {
    type: String,
    enum: {
      values: ["male", "Male", "female", "Female", "others", "Others"],
      message: `{VALUE} is an invalid status`,
    },
  },
  skills: {
    type: [String],
  },
  about: {
    type: String,
    default: "contains some info about you !",
  },
  photoUrl: {
    type: String,
    default: "https://www.svgrepo.com/show/335455/profile-default.svg",
  },
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