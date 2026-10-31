
import dotenv from "dotenv";

dotenv.config();

export const config = {
    // Server configuration
    port: Number(process.env.PORT || 5000),

    // MongoDB configuration
    mongoUri:
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/actverse",

    // JWT configuration
    jwtSecret:
        process.env.JWT_SECRET || "development-only-change-me",

    // Frontend URL
    clientOrigin:
        process.env.CLIENT_ORIGIN || "http://localhost:5173",

    // Admin configuration
    adminEmail:
        (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase(),

    adminPassword:
        process.env.ADMIN_PASSWORD || "ChangeMe123!",

    adminName:
        process.env.ADMIN_NAME || "RojaShree",

    // Rules configuration
    rulesVersion:
        process.env.RULES_VERSION || "1.0"
};
