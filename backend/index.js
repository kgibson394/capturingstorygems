
// const dns = require("node:dns");
// dns.setServers(['1.1.1.1', '8.8.8.8']);
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const path = require("path");
// require("dotenv").config();
// const { Mongoose } = require("./src/configs/database.js");
// const app = express();
// const port = process.env.PORT || 3001;
// const appName = process.env.APP_NAME;
// const version = process.env.API_VERSION;


// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://capturingstorygems.vercel.app",
//   "https://www.capturingstorygems.com",
//   "https://ai-story-frontend-ten.vercel.app",
//   "https://ai-story-fe.vercel.app",
//   "https://ai-story-front.vercel.app",
// ];

// // CORS must be applied before routes so OPTIONS preflights get the headers.
// // Also, for credentialed requests, the response must include a specific origin,
// // not "*", so we reflect only if it's allow-listed.
// const corsOptions = {
//   origin: (origin, callback) => {
//     // allow non-browser callers and same-origin (no Origin header)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(null, false);
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 204,
// };

// app.use(cors(corsOptions));
// // Ensure preflight requests always get a CORS response.
// app.options("*", cors(corsOptions));


// // ✅ DB connect middleware (runs once per cold start, cached after)
// // app.use(async (req, res, next) => {
// //   try {
// //     await connectDB();
// //     next();
// //   } catch (err) {
// //     console.error("DB connect failed:", err);
// //     res.status(500).json({
// //       message: "Internal server error",
// //       response: null,
// //       error: "Database connection failed",
// //     });
// //   }
// // });

// const userRoutes = require("./src/routes/user/index.js");
// const adminRoutes = require("./src/routes/admin/index.js");
// const webhookRoutes = require("./src/routes/user/webhook.js");
// const { checkoutComplete } = require("./src/controllers/user/plan");

// app.post(
//   `/api/${version}/user/plan/checkout`,
//   // Stripe webhook signature verification requires the raw body.
//   express.raw({ type: "application/json" }),
//   checkoutComplete
// );

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(express.json({ limit: "50mb" }));

// app.use(`/api/${version}/ping`, (req, res) => {
//   return res.send("Welcome to Ai Story Builder Backend!");
// });

// app.use('/api/webhooks', webhookRoutes);
// app.use(`/api/${version}/user`, userRoutes);
// app.use(`/api/${version}/admin`, adminRoutes);

// app.listen(port, () => {
//   console.log(`${appName} App is Running at port ${port}`);
// });



const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import DB connection logic
const { Mongoose } = require("./src/configs/database.js");

const app = express();
const port = process.env.PORT || 3001;
const appName = process.env.APP_NAME || "AI Story Builder";
const version = process.env.API_VERSION || "v1";

// 1. Define Allowed Origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://capturingstorygems.vercel.app",
  "https://www.capturingstorygems.com",
  "https://ai-story-frontend-ten.vercel.app",
  "https://ai-story-fe.vercel.app",
  "https://ai-story-front.vercel.app",
];

// 2. CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// 3. Apply Global Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight for all routes

// 4. Special Route: Stripe Webhook (MUST come before general body parsers)
const { checkoutComplete } = require("./src/controllers/user/plan");
app.post(
  `/api/${version}/user/plan/checkout`,
  express.raw({ type: "application/json" }),
  checkoutComplete
);

// 5. General Body Parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 6. Routes
const userRoutes = require("./src/routes/user/index.js");
const adminRoutes = require("./src/routes/admin/index.js");
const webhookRoutes = require("./src/routes/user/webhook.js");

app.get(`/api/${version}/ping`, (req, res) => {
  return res.status(200).json({ 
    message: "Welcome to Ai Story Builder Backend!",
    status: "Online" 
  });
});

app.use('/api/webhooks', webhookRoutes);
app.use(`/api/${version}/user`, userRoutes);
app.use(`/api/${version}/admin`, adminRoutes);

// 7. 404 Handler (Crucial for CORS)
// If a route isn't found, we still want to send CORS headers
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`${appName} App is Running at port ${port}`);
});