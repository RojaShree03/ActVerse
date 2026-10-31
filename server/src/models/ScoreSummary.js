import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema({
  fanId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  cumulativeScore: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  participationCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("ScoreSummary", scoreSchema);
