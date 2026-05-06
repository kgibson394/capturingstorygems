const dns = require("node:dns");
dns.setServers(['1.1.1.1', '8.8.8.8']);
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
  "http://localhost:3001",
  "https://capturingstorygems.vercel.app",
  "https://www.capturingstorygems.com",
  "https://ai-story-frontend-ten.vercel.app",
  "https://ai-story-fe.vercel.app",
  "https://ai-story-front.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Apply standard CORS middleware
app.use(cors(corsOptions));

// CRITICAL FIX: Explicitly handle preflight (OPTIONS) requests
app.options('*', cors(corsOptions));

const userRoutes = require("./src/routes/user/index.js");
const adminRoutes = require("./src/routes/admin/index.js");
const webhookRoutes = require("./src/routes/user/webhook.js");
const { checkoutComplete } = require("./src/controllers/user/plan");

app.post(
  `/api/${version}/user/plan/checkout`,
  express.raw({ type: "application/json" }),
  checkoutComplete
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "50mb" }));

app.use(`/api/${version}/ping`, (req, res) => {
  return res.send("Welcome to Ai Story Builder Backend!");
});

app.use('/api/webhooks', webhookRoutes);
app.use(`/api/${version}/user`, userRoutes);
app.use(`/api/${version}/admin`, adminRoutes);

app.listen(port, () => {
  console.log(`${appName} App is Running at port ${port}`);
});