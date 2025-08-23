require("dotenv").config();
const mongoose = require("mongoose");
const {configurations} = require("./config");
const { runSeeder } = require("./seeders");
const mongoString = configurations.mongoDbUrl;

mongoose
  .connect(mongoString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongodb connected successfully");
  })
  .catch((error) => {
    console.log("Mongodb connection error:", error);
  });

// runSeeder();

module.exports = mongoose;
