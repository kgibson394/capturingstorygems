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







// require("dotenv").config();
// const mongoose = require("mongoose");
// const { configurations } = require("./config");

// const mongoString = configurations.mongoDbUrl;
// if (!mongoString) throw new Error("Missing MongoDB connection string (mongoDbUrl)");

// let cached = global.__mongoose;
// if (!cached) cached = global.__mongoose = { conn: null, promise: null };

// async function connectDB() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(mongoString, {
//       serverSelectionTimeoutMS: 30000,
//       bufferCommands: false, // fail fast if not connected
//     });
//   }

//   cached.conn = await cached.promise;
//   console.log("Mongodb connected successfully");
//   return cached.conn;
// }

// module.exports = { connectDB };