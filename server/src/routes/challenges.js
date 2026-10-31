
import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

import Challenge from "../models/Challenge.js";
import Vote from "../models/Vote.js";
import ScoreSummary from "../models/ScoreSummary.js";

import {
  requireAuth,
  requireAdmin,
  requireInfluencer,
  requireInfluencerOrAdmin,
  requireCurrentRules
} from "../middleware/auth.js";

import { addPoints } from "../utils/scores.js";

const router = Router();

const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
const TOKEN_EXPIRY = 30 * 60 * 1000;

const allowedEmotions = [
  "happy",
  "sad",
  "angry",
  "joyful",
  "romantic",
  "motivational",
  "other"
];

const activeFilter = () => ({
  status: { $in: ["active", "completed"] },
  expiresAt: { $gt: new Date() }
});

// --------------------------------------------------
// REVEAL TOKEN HELPERS
// --------------------------------------------------

function createRevealToken(challengeId, voterId) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const payload = {
    challengeId: String(challengeId),
    voterId,
    expiresAt: Date.now() + TOKEN_EXPIRY
  };

  const encoded = Buffer
    .from(JSON.stringify(payload))
    .toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

function verifyRevealToken(token, challengeId, voterId) {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret || typeof token !== "string") {
      return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) return false;

    const [encoded, suppliedSignature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(encoded)
      .digest();

    const actualSignature = Buffer.from(
      suppliedSignature,
      "base64url"
    );

    if (
      actualSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        actualSignature,
        expectedSignature
      )
    ) {
      return false;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    );

    return (
      payload.challengeId === String(challengeId) &&
      payload.voterId === voterId &&
      Number(payload.expiresAt) > Date.now()
    );
  } catch {
    return false;
  }
}

// --------------------------------------------------
// 1. PUBLIC CHALLENGES
// --------------------------------------------------

router.get("/", async (req, res, next) => {
  try {
    const challenges = await Challenge.find(activeFilter())
      .select(
        "dialogue submittedBy status activatedAt expiresAt createdAt completedAt acceptedBy acceptedAt +instagramUrl"
      )
      .populate("acceptedBy", "username")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ challenges });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 2. FAN SUBMITS DIALOGUE
// AUTOMATICALLY PUBLIC
// --------------------------------------------------

router.post(
  "/",
  requireAuth,
  requireCurrentRules,
  async (req, res, next) => {
    try {
      if (
        !["fan", "admin"].includes(req.user.role)
      ) {
        return res.status(403).json({
          message: "Only fans can submit dialogues."
        });
      }

      const dialogue = String(
        req.body.dialogue || ""
      ).trim();

      const privateEmotion = String(
        req.body.privateEmotion || "other"
      );

      const password = String(
        req.body.privateEmotionPassword || ""
      );

      if (dialogue.length < 2 || dialogue.length > 1000) {
        return res.status(400).json({
          message: "Dialogue must be between 2 and 1000 characters."
        });
      }

      if (!allowedEmotions.includes(privateEmotion)) {
        return res.status(400).json({
          message: "Invalid emotion selected."
        });
      }

      if (password.length < 4 || password.length > 64) {
        return res.status(400).json({
          message: "Reveal password must be between 4 and 64 characters."
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const activatedAt = new Date();

      const expiresAt = new Date(
        activatedAt.getTime() + FIVE_DAYS
      );

      const challenge = await Challenge.create({
        dialogue,
        privateEmotion,
        privateEmotionPasswordHash: passwordHash,
        submittedBy: req.user._id,
        status: "active",
        activatedAt,
        expiresAt,
        acceptedBy: null,
        acceptedAt: null
      });

      await addPoints(req.user._id, {
        score: 1
      });

      res.status(201).json({
        message: "Challenge submitted and published successfully!",
        challenge: {
          id: challenge._id,
          dialogue: challenge.dialogue,
          status: challenge.status,
          activatedAt: challenge.activatedAt,
          expiresAt: challenge.expiresAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// --------------------------------------------------
// 3. MY SUBMISSIONS
// --------------------------------------------------

router.get(
  "/mine",
  requireAuth,
  requireCurrentRules,
  async (req, res, next) => {
    try {
      const challenges = await Challenge.find({
        submittedBy: req.user._id
      })
        .select(
          "dialogue status activatedAt expiresAt createdAt completedAt acceptedBy acceptedAt +instagramUrl"
        )
        .populate("acceptedBy", "username")
        .sort({ createdAt: -1 });

      res.json({ challenges });
    } catch (error) {
      next(error);
    }
  }
);

// --------------------------------------------------
// 4. INFLUENCER DASHBOARD
// AVAILABLE CHALLENGES
// --------------------------------------------------

router.get(
  "/influencer/available",
  requireAuth,
  requireCurrentRules,
  requireInfluencer,
  async (req, res, next) => {
    try {
      const challenges = await Challenge.find({
        status: "active",
        expiresAt: { $gt: new Date() },
        $or: [
          { acceptedBy: null },
          { acceptedBy: { $exists: false } },
          { acceptedBy: req.user._id }
        ]
      })
        .select(
          "dialogue submittedBy status createdAt activatedAt expiresAt acceptedBy acceptedAt"
        )
        .populate("submittedBy", "username")
        .sort({ createdAt: -1 });

      res.json({ challenges });
    } catch (error) {
      next(error);
    }
  }
);

// --------------------------------------------------
// 5. INFLUENCER ACCEPTS CHALLENGE
// ONLY ONE INFLUENCER CAN ACCEPT
// --------------------------------------------------

router.post(
  "/:id/accept",
  requireAuth,
  requireCurrentRules,
  requireInfluencer,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid challenge ID."
        });
      }

      const challenge = await Challenge.findOneAndUpdate(
        {
          _id: req.params.id,
          status: "active",
          expiresAt: { $gt: new Date() },
          $or: [
            { acceptedBy: null },
            { acceptedBy: { $exists: false } }
          ]
        },
        {
          $set: {
            acceptedBy: req.user._id,
            acceptedAt: new Date()
          }
        },
        {
          new: true
        }
      ).select(
        "dialogue status acceptedBy acceptedAt expiresAt"
      );

      if (!challenge) {
        return res.status(409).json({
          message: "This challenge is already accepted or expired."
        });
      }

      res.json({
        message: "Challenge accepted successfully!",
        challenge
      });
    } catch (error) {
      next(error);
    }
  }
);

// --------------------------------------------------
// 6. REVEAL PRIVATE EMOTION
// ALL VISITORS CAN USE THIS
// --------------------------------------------------

router.post("/:id/reveal-emotion", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid challenge ID."
      });
    }

    const password = String(req.body.password || "");
    const voterId = String(req.body.voterId || "");

    if (!password) {
      return res.status(400).json({
        message: "Enter the private emotion password."
      });
    }

    if (voterId.length < 16 || voterId.length > 100) {
      return res.status(400).json({
        message: "Refresh the page and try again."
      });
    }

    const challenge = await Challenge.findOne({
      _id: req.params.id,
      ...activeFilter()
    }).select(
      "+privateEmotion +privateEmotionPasswordHash"
    );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found or expired."
      });
    }

    const valid = await bcrypt.compare(
      password,
      challenge.privateEmotionPasswordHash
    );

    if (!valid) {
      return res.status(403).json({
        message: "Incorrect emotion password."
      });
    }

    const revealToken = createRevealToken(
      challenge._id,
      voterId
    );

    res.json({
      message: "Emotion revealed successfully.",
      emotion: challenge.privateEmotion,
      revealToken,
      expiresInSeconds: TOKEN_EXPIRY / 1000
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 7. PUBLIC VOTING
// EMOTION REVEAL IS COMPULSORY
// --------------------------------------------------

router.post("/:id/vote", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid challenge ID."
      });
    }

    const challenge = await Challenge.findOne({
      _id: req.params.id,
      ...activeFilter()
    });

    if (!challenge || challenge.status !== "active") {
      return res.status(404).json({
        message: "Active challenge not found."
      });
    }

    const verdict = String(
      req.body.verdict || ""
    ).toUpperCase();

    if (!["PASS", "FAIL"].includes(verdict)) {
      return res.status(400).json({
        message: "Choose PASS or FAIL."
      });
    }

    const voterId = String(req.body.voterId || "");
    const revealToken = String(req.body.revealToken || "");

    if (voterId.length < 16 || voterId.length > 100) {
      return res.status(400).json({
        message: "Refresh the page and try again."
      });
    }

    if (
      !verifyRevealToken(
        revealToken,
        challenge._id,
        voterId
      )
    ) {
      return res.status(403).json({
        message: "Reveal the private emotion before voting."
      });
    }

    const feedback = String(
      req.body.feedback || ""
    ).trim().slice(0, 1000);

    const voterKey = crypto
      .createHash("sha256")
      .update(`${challenge._id}:${voterId}`)
      .digest("hex");

    try {
      await Vote.create({
        challengeId: challenge._id,
        fanId: null,
        voterKey,
        verdict,
        feedback
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "You have already voted on this challenge."
        });
      }

      throw error;
    }

    res.status(201).json({
      message: "Vote submitted."
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 8. LEADERBOARD
// --------------------------------------------------

router.get("/leaderboard", async (req, res, next) => {
  try {
    const leaderboard = await ScoreSummary.find()
      .populate("fanId", "username")
      .sort({
        cumulativeScore: -1,
        completedTasks: -1
      })
      .limit(50)
      .lean();

    res.json({
      leaderboard: leaderboard.map(s => ({
        username: s.fanId?.username || "Fan",
        cumulativeScore: s.cumulativeScore,
        completedTasks: s.completedTasks
      }))
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 9. ADMIN OVERVIEW
// --------------------------------------------------

router.get(
  "/admin/overview",
  requireAuth,
  requireCurrentRules,
  requireAdmin,
  async (req, res, next) => {
    try {
      const User = (await import("../models/User.js")).default;
      const LoginEvent = (await import("../models/LoginEvent.js")).default;

      const [
        registeredMembers,
        registeredInfluencers,
        pendingInfluencers,
        activeChallenges,
        totalDialogues,
        totalVotes,
        loginsToday
      ] = await Promise.all([
        User.countDocuments({ role: "fan" }),

        User.countDocuments({
          role: "influencer",
          influencerStatus: "approved"
        }),

        User.countDocuments({
          influencerStatus: "pending"
        }),

        Challenge.countDocuments({
          ...activeFilter(),
          status: "active"
        }),

        Challenge.countDocuments(),

        Vote.countDocuments(),

        LoginEvent.countDocuments({
          createdAt: {
            $gte: new Date(
              Date.now() - 24 * 60 * 60 * 1000
            )
          }
        })
      ]);

      res.json({
        registeredMembers,
        registeredInfluencers,
        pendingInfluencers,
        activeChallenges,
        totalDialogues,
        totalVotes,
        loginsToday
      });
    } catch (error) {
      next(error);
    }
  }
);

// --------------------------------------------------
// 10. ADMIN VIEW ALL CHALLENGES
// --------------------------------------------------

router.get(
  "/admin/all",
  requireAuth,
  requireCurrentRules,
  requireAdmin,
  async (req, res, next) => {
    try {
      const challenges = await Challenge.find({
        expiresAt: { $gt: new Date() }
      })
        .select(
          "dialogue status createdAt submittedBy activatedAt expiresAt completedAt acceptedBy acceptedAt +instagramUrl"
        )
        .populate("submittedBy", "username")
        .populate("acceptedBy", "username")
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ challenges });
    } catch (error) {
      next(error);
    }
  }
);

// --------------------------------------------------
// 11. INFLUENCER / ADMIN PUBLISHES INSTAGRAM LINK
// --------------------------------------------------

router.post(
  "/:id/publish",
  requireAuth,
  requireCurrentRules,
  requireInfluencerOrAdmin,
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid challenge ID."
        });
      }

      const url = String(
        req.body.instagramUrl || ""
      ).trim();

      let parsed;

      try {
        parsed = new URL(url);
      } catch {
        return res.status(400).json({
          message: "Enter a valid Instagram URL."
        });
      }

      if (
        !["instagram.com", "www.instagram.com"].includes(
          parsed.hostname
        ) ||
        parsed.protocol !== "https:"
      ) {
        return res.status(400).json({
          message: "Enter a valid HTTPS Instagram URL."
        });
      }

      const isAdmin = req.user.role === "admin";

      const filter = {
        _id: req.params.id,
        status: "active",
        expiresAt: { $gt: new Date() }
      };

      // Influencers can publish only challenges they accepted.
      if (!isAdmin) {
        filter.acceptedBy = req.user._id;
      }

      const challenge = await Challenge.findOneAndUpdate(
        filter,
        {
          $set: {
            instagramUrl: url,
            completedAt: new Date(),
            status: "completed"
          }
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!challenge) {
        return res.status(404).json({
          message: "Challenge not found, not accepted by you, or already completed."
        });
      }

      // Award performance completion points to the influencer.
      const pointsUser = challenge.acceptedBy || req.user._id;

      await addPoints(pointsUser, {
        score: 2,
        completed: 1
      });

      res.json({
        message: "Instagram video link published successfully.",
        instagramUrl: challenge.instagramUrl,
        challenge
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
