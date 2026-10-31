
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
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
// SEND OTP
// --------------------------------------------------

async function sendOtp(email, purpose, payload = null) {
    if (!config.smtpUser || !config.smtpPass) {
        throw new Error("Gmail SMTP is not configured.");
    }

    const code = String(
        Math.floor(100000 + Math.random() * 900000)
    );

    await Otp.deleteMany({ email, purpose });

    await Otp.create({
        email,
        purpose,
        codeHash: await bcrypt.hash(code, 10),
        payload,
        expiresAt: new Date(
            Date.now() + config.otpExpiryMinutes * 60000
        )
    });

    const mail = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPass
        }
    });

    await mail.sendMail({
        from: `ActVerse <${config.smtpUser}>`,
        to: email,
        subject: "Your ActVerse verification code",
        text: `Your verification code is ${code}. It expires in ${config.otpExpiryMinutes} minutes. Do not share it.`
    });
}

// --------------------------------------------------
// VERIFY OTP
// --------------------------------------------------

async function verifyOtp(email, purpose, code) {
    const otp = await Otp.findOne({ email, purpose });

    if (
        !otp ||
        otp.expiresAt < new Date() ||
        otp.attempts >= 5
    ) {
        return {
            error: "OTP expired. Please try again."
        };
    }

    if (
        !(await bcrypt.compare(
            String(code || ""),
            otp.codeHash
        ))
    ) {
        otp.attempts++;
        await otp.save();

        return {
            error: "Incorrect OTP."
        };
    }

    await Otp.deleteMany({ email, purpose });

    return { otp };
}

// --------------------------------------------------
// 1. REGISTER
// Fan or Influencer registration
// OTP required
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

        // Accept accountType from frontend.
        // Also accept requestedRole or role for compatibility.
        const requestedRole = String(
            req.body.accountType ||
            req.body.requestedRole ||
            req.body.role ||
            "fan"
        ).toLowerCase();

        if (!["fan", "influencer"].includes(requestedRole)) {
            return res.status(400).json({
                message: "Invalid registration type."
            });
        }

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

        if (await User.exists({ email })) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        await sendOtp(email, "register", {
            username,
            passwordHash: await bcrypt.hash(password, 12),
            requestedRole
        });

        res.json({
            message: "OTP sent to your email.",
            email,
            requestedRole
        });
    } catch (error) {
        next(error);
    }
});

// --------------------------------------------------
// 2. REGISTER OTP VERIFICATION
// --------------------------------------------------

router.post(
    "/register/verify",
    async (req, res, next) => {
        try {
            const email = String(
                req.body.email || ""
            ).trim().toLowerCase();

            const verification = await verifyOtp(
                email,
                "register",
                req.body.otp
            );

            if (verification.error) {
                return res.status(400).json({
                    message: verification.error
                });
            }

            if (await User.exists({ email })) {
                return res.status(409).json({
                    message: "Email already registered."
                });
            }

            const payload = verification.otp.payload || {};

            const requestedRole =
                payload.requestedRole === "influencer"
                    ? "influencer"
                    : "fan";

            // Influencer applicants remain fans until approval.
            const user = await User.create({
                username: payload.username,
                email,
                passwordHash: payload.passwordHash,
                emailVerified: true,

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
    }
);

// --------------------------------------------------
// 3. LOGIN
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

        user.lastLoginAt = new Date();
        await user.save();

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
// 4. CURRENT USER
// --------------------------------------------------

router.get("/me", requireAuth, async (req, res) => {
    const user = await User.findById(req.user._id);

    res.json({
        user: publicUser(user)
    });
});

// --------------------------------------------------
// 5. EXISTING FAN REQUESTS INFLUENCER ROLE
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
// 6. ADMIN - VIEW PENDING INFLUENCER APPLICATIONS
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
// 7. ADMIN - APPROVE INFLUENCER
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
// 8. ADMIN - REJECT INFLUENCER
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
// 9. ACCEPT RULES
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
// 10. CHANGE LANGUAGE
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
