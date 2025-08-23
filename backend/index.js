const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { Mongoose } = require("./src/configs/database.js");
const app = express();
const port = process.env.PORT || 3001;
const appName = process.env.APP_NAME;
const version = process.env.API_VERSION;

const allowedOrigins = [
  "http://localhost:3000",
  "https://capturingstorygems.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const userRoutes = require("./src/routes/user/index.js");
const adminRoutes = require("./src/routes/admin/index.js");
const { checkoutComplete } = require("./src/controllers/user/plan");

app.post(
  `/api/${version}/user/plan/checkout`,
  express.raw({ type: "application/json" }),
  checkoutComplete
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.use(`/api/${version}/ping`, (req, res) => {
  return res.send("Welcome to Ai Story Builder Backend!");
});

app.use(`/api/${version}/user`, userRoutes);
app.use(`/api/${version}/admin`, adminRoutes);

app.listen(port, () => {
  console.log(`${appName} App is Running at port ${port}`);
});

