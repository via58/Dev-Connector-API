const mongoose = require("mongoose");
const config = require("config");
const connectionString = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, { useNewUrlParser: true });
    console.log("DB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
