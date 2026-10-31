import { Router } from "express";
import { requireAuth, requireCurrentRules } from "../middleware/auth.js";

const router = Router();
router.post("/preview", requireAuth, requireCurrentRules, async (req, res) => {
  const text = String(req.body.text || "").trim();
  const targetLanguage = String(req.body.targetLanguage || "");
  if (!text) return res.status(400).json({ message: "Text is required." });
  if (!["en", "ta"].includes(targetLanguage)) return res.status(400).json({ message: "Unsupported target language." });
  return res.status(501).json({ message: "Translation provider is not configured. Original content is preserved." });
});
export default router;
