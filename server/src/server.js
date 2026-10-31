import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import User from "./models/User.js";
import Challenge from "./models/Challenge.js";
import Vote from "./models/Vote.js";
import authRoutes from "./routes/auth.js";
import challengeRoutes from "./routes/challenges.js";
import translationRoutes from "./routes/translation.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", name: "ActVerse API" }));
app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/translation", translationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.name === "ValidationError") return res.status(400).json({ message: "Invalid input." });
  res.status(500).json({ message: "Unexpected server error." });
});

async function seedAdmin() {
  const existing = await User.findOne({ email: config.adminEmail });
  if (!existing) {
    await User.create({
      username: config.adminName,
      email: config.adminEmail,
      passwordHash: await bcrypt.hash(config.adminPassword, 12),
      role: "admin",
      acceptedRulesVersion: config.rulesVersion,
      acceptedRulesAt: new Date()
    });
    console.log(`Seeded admin account: ${config.adminEmail}`);
  }
}

async function cleanupExpiredChallenges() {
  const now = new Date();
  const expired = await Challenge.find({ status: { $in: ["active", "completed"] }, expiresAt: { $lte: now } }).select("_id");
  if (!expired.length) return;
  const ids = expired.map(c => c._id);
  await Vote.deleteMany({ challengeId: { $in: ids } });
  await Challenge.deleteMany({ _id: { $in: ids } });
  console.log(`Expired ${ids.length} challenge(s) and related votes.`);
}

async function start() {
  await mongoose.connect(config.mongoUri);
  await seedAdmin();
  await cleanupExpiredChallenges();
  setInterval(() => cleanupExpiredChallenges().catch(err => console.error("Cleanup failed:", err)), 60 * 60 * 1000);
  app.listen(config.port, () => console.log(`ActVerse API listening on ${config.port}`));
}
start().catch(err => { console.error("Startup failed:", err); process.exit(1); });
