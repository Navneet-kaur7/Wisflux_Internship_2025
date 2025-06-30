const mongoose = require("mongoose");
//connect to db

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB has been connected");
  } catch (error) {
    console.log("DB Connection failed", error.message);
  }
};

module.exports = connectDB;

