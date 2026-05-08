/**
 * Vercel serverless entry – exports Express app for Vercel deployment.
 * Local dev still uses index.js (with node/nodemon).
 */
import "dotenv/config";
import express from "express";
import { connectDB } from "./src/utils/db.util.js";
import { app } from "./src/server/serverApp.js";

void express;

await connectDB();

export default app;
