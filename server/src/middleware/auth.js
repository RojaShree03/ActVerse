
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";

// --------------------------------------------------
// 1. AUTHENTICATION
// --------------------------------------------------

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        message: "Authentication required."
      });
    }

    const payload = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(payload.sub).select(
      "username email role influencerStatus preferredLanguage acceptedRulesVersion"
    );

    if (!user) {
      return res.status(401).json({
        message: "Account not found."
      });
    }

    req.user = user;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired session."
    });
  }
}

// --------------------------------------------------
// 2. ADMIN ACCESS
// --------------------------------------------------

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required."
    });
  }

  next();
}

// --------------------------------------------------
// 3. APPROVED INFLUENCER ACCESS
// --------------------------------------------------

export function requireInfluencer(req, res, next) {
  if (
    req.user?.role !== "influencer" ||
    req.user?.influencerStatus !== "approved"
  ) {
    return res.status(403).json({
      message: "Approved influencer access required."
    });
  }

  next();
}

// --------------------------------------------------
// 4. INFLUENCER OR ADMIN ACCESS
// --------------------------------------------------

export function requireInfluencerOrAdmin(req, res, next) {
  const isAdmin = req.user?.role === "admin";

  const isApprovedInfluencer =
    req.user?.role === "influencer" &&
    req.user?.influencerStatus === "approved";

  if (!isAdmin && !isApprovedInfluencer) {
    return res.status(403).json({
      message: "Approved influencer access required."
    });
  }

  next();
}

// --------------------------------------------------
// 5. CURRENT RULES ACCEPTANCE
// --------------------------------------------------

export function requireCurrentRules(req, res, next) {
  if (
    req.user?.acceptedRulesVersion !== config.rulesVersion
  ) {
    return res.status(403).json({
      code: "RULES_ACCEPTANCE_REQUIRED",
      message: "Please accept the current rules before entering the game."
    });
  }

  next();
}
