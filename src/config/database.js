require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async() => {
  await mongoose.connect(process.env.DB_CONNECTION_STRING)
}

console.log("Mongo URI:", process.env.MONGODB_URI);



module.exports = connectDB