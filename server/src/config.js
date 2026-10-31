
import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: Number(process.env.PORT || 5000),

    mongoUri:
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/actverse",

    jwtSecret:
        process.env.JWT_SECRET || "development-only-change-me",

    clientOrigin:
        process.env.CLIENT_ORIGIN || "http://localhost:5173",

    adminEmail:
        (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),

    adminPassword:
        process.env.ADMIN_PASSWORD || "ChangeMe123!",

    adminName:
        process.env.ADMIN_NAME || "RojaShree",

    rulesVersion:
        process.env.RULES_VERSION || "1.0",

    // Resend email API
    resendApiKey: process.env.RESEND_API_KEY || "",
    emailFrom: process.env.EMAIL_FROM || "onboarding@resend.dev",

    otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10)
};
