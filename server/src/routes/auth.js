
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import LoginEvent from "../models/LoginEvent.js";

import { config } from "../config.js";

import {
    requireAuth,
    requireAdmin
} from "../middleware/auth.js";

const router = Router();

// --------------------------------------------------
// JWT TOKEN
// --------------------------------------------------

const tokenFor = (user) =>
    jwt.sign(
        { sub: user._id.toString() },
        config.jwtSecret,
        { expiresIn: "7d" }
    );

// --------------------------------------------------
// PUBLIC USER DATA
// --------------------------------------------------

const publicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    influencerStatus: user.influencerStatus || "not_requested",
    preferredLanguage: user.preferredLanguage,
    acceptedRulesVersion: user.acceptedRulesVersion,
    acceptedRulesAt: user.acceptedRulesAt
});

// --------------------------------------------------
// 1. REGISTER
// Direct registration without OTP
// --------------------------------------------------

router.post("/register", async (req, res, next) => {

    try {

        const username = String(
            req.body.username || ""
        ).trim();

        const email = String(
            req.body.email || ""
        ).trim().toLowerCase();

        const password = String(
            req.body.password || ""
        );

        const requestedRole = String(
            req.body.accountType ||
            req.body.requestedRole ||
            req.body.role ||
            "fan"
        ).toLowerCase();

        // Validate account type
        if (!["fan", "influencer"].includes(requestedRole)) {
            return res.status(400).json({
                message: "Invalid registration type."
            });
        }

        // Validate input
        if (
            username.length < 2 ||
            username.length > 30 ||
            !email ||
            password.length < 8
        ) {
            return res.status(400).json({
                message:
                    "Enter username, email and password (minimum 8 characters)."
            });
        }

        // Check existing email
        if (await User.exists({ email })) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user directly without OTP
        const user = await User.create({

            username,
            email,
            passwordHash,

            // Email verification is not required
            emailVerified: true,

            // Influencers need admin approval
            role: "fan",

            influencerStatus:
                requestedRole === "influencer"
                    ? "pending"
                    : "not_requested",

            influencerRequestedAt:
                requestedRole === "influencer"
                    ? new Date()
                    : null
        });

        // Generate JWT token
        res.status(201).json({

            message:
                requestedRole === "influencer"
                    ? "Registration successful. Your influencer application is pending admin approval."
                    : "Fan registration successful.",

            token: tokenFor(user),

            user: publicUser(user)

        });

    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------
// 2. LOGIN
// Email and Password
// --------------------------------------------------

router.post("/login", async (req, res, next) => {

    try {

        const email = String(
            req.body.email || ""
        ).trim().toLowerCase();

        const password = String(
            req.body.password || ""
        );

        const user = await User.findOne({ email })
            .select("+passwordHash");

        if (
            !user ||
            !(await bcrypt.compare(
                password,
                user.passwordHash
            ))
        ) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Update last login
        user.lastLoginAt = new Date();

        await user.save();

        // Record login event
        await LoginEvent.create({
            userId: user._id
        });

        res.json({

            message: "Login successful.",

            token: tokenFor(user),

            user: publicUser(user)

        });

    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------
// 3. CURRENT USER
// --------------------------------------------------

router.get("/me", requireAuth, async (req, res) => {

    const user = await User.findById(req.user._id);

    res.json({
        user: publicUser(user)
    });
});

// --------------------------------------------------
// 4. EXISTING FAN REQUESTS INFLUENCER ROLE
// --------------------------------------------------

router.post(
    "/influencer/request",
    requireAuth,
    async (req, res, next) => {

        try {

            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    message: "User not found."
                });
            }

            if (user.role === "admin" || user.role === "influencer") {
                return res.status(400).json({
                    message: "Your account already has an elevated role."
                });
            }

            if (user.influencerStatus === "pending") {
                return res.status(409).json({
                    message: "Your influencer application is already pending."
                });
            }

            user.influencerStatus = "pending";
            user.influencerRequestedAt = new Date();

            await user.save();

            res.json({
                message: "Influencer application submitted for admin approval.",
                user: publicUser(user)
            });

        } catch (error) {
            next(error);
        }
    }
);

// --------------------------------------------------
// 5. ADMIN - VIEW PENDING INFLUENCER APPLICATIONS
// --------------------------------------------------

router.get(
    "/admin/influencers/pending",
    requireAuth,
    requireAdmin,
    async (req, res, next) => {

        try {

            const users = await User.find({
                influencerStatus: "pending"
            })
                .select(
                    "username email role influencerStatus influencerRequestedAt createdAt"
                )
                .sort({ influencerRequestedAt: 1 });

            res.json({
                applications: users
            });

        } catch (error) {
            next(error);
        }
    }
);

// --------------------------------------------------
// 6. ADMIN - APPROVE INFLUENCER
// --------------------------------------------------

router.post(
    "/admin/influencers/:id/approve",
    requireAuth,
    requireAdmin,
    async (req, res, next) => {

        try {

            if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
                return res.status(400).json({
                    message: "Invalid user ID."
                });
            }

            const user = await User.findOne({
                _id: req.params.id,
                influencerStatus: "pending"
            });

            if (!user) {
                return res.status(404).json({
                    message: "Pending influencer application not found."
                });
            }

            user.role = "influencer";
            user.influencerStatus = "approved";
            user.influencerApprovedAt = new Date();
            user.influencerApprovedBy = req.user._id;

            await user.save();

            res.json({
                message: "Influencer approved successfully.",
                user: publicUser(user)
            });

        } catch (error) {
            next(error);
        }
    }
);

// --------------------------------------------------
// 7. ADMIN - REJECT INFLUENCER
// --------------------------------------------------

router.post(
    "/admin/influencers/:id/reject",
    requireAuth,
    requireAdmin,
    async (req, res, next) => {

        try {

            if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
                return res.status(400).json({
                    message: "Invalid user ID."
                });
            }

            const user = await User.findOne({
                _id: req.params.id,
                influencerStatus: "pending"
            });

            if (!user) {
                return res.status(404).json({
                    message: "Pending influencer application not found."
                });
            }

            user.role = "fan";
            user.influencerStatus = "rejected";

            await user.save();

            res.json({
                message: "Influencer application rejected.",
                user: publicUser(user)
            });

        } catch (error) {
            next(error);
        }
    }
);

// --------------------------------------------------
// 8. ACCEPT RULES
// --------------------------------------------------

router.post(
    "/accept-rules",
    requireAuth,
    async (req, res, next) => {

        try {

            const user = await User.findById(req.user._id);

            user.acceptedRulesVersion = config.rulesVersion;
            user.acceptedRulesAt = new Date();

            await user.save();

            res.json({
                user: publicUser(user),
                rulesVersion: config.rulesVersion
            });

        } catch (error) {
            next(error);
        }
    }
);

// --------------------------------------------------
// 9. CHANGE LANGUAGE
// --------------------------------------------------

router.patch(
    "/language",
    requireAuth,
    async (req, res, next) => {

        try {

            if (!["en", "ta"].includes(req.body.language)) {
                return res.status(400).json({
                    message: "Unsupported language."
                });
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                {
                    preferredLanguage: req.body.language
                },
                { new: true }
            );

            res.json({
                user: publicUser(user)
            });

        } catch (error) {
            next(error);
        }
    }
);

export default router;
