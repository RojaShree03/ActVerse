import mongoose from "mongoose";

const loginEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventType: { type: String, enum: ["login"], default: "login" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("LoginEvent", loginEventSchema);
