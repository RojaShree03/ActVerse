import ScoreSummary from "../models/ScoreSummary.js";

export async function addPoints(fanId, { score = 0, completed = 0, participation = 0 } = {}) {
  await ScoreSummary.findOneAndUpdate(
    { fanId },
    { $inc: { cumulativeScore: score, completedTasks: completed, participationCount: participation } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}
