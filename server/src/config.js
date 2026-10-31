import dotenv from "dotenv";
dotenv.config();
export const config = {
 port:Number(process.env.PORT||5000), mongoUri:process.env.MONGODB_URI||"mongodb://127.0.0.1:27017/actverse",
 jwtSecret:process.env.JWT_SECRET||"development-only-change-me", clientOrigin:process.env.CLIENT_ORIGIN||"http://localhost:5173",
 adminEmail:(process.env.ADMIN_EMAIL||"admin@example.com").toLowerCase(), adminPassword:process.env.ADMIN_PASSWORD||"ChangeMe123!",
 adminName:process.env.ADMIN_NAME||"RojaShree", rulesVersion:process.env.RULES_VERSION||"1.0",
 smtpHost:process.env.SMTP_HOST||"smtp.gmail.com", smtpPort:Number(process.env.SMTP_PORT||587),
 smtpUser:process.env.SMTP_USER||"", smtpPass:process.env.SMTP_PASS||"", otpExpiryMinutes:Number(process.env.OTP_EXPIRY_MINUTES||10)
};
