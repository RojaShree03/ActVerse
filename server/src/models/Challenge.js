import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema({
  dialogue: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Fan's secret emotion
  privateEmotion: {
    type: String,
    enum: [
      "happy",
      "sad",
      "angry",
      "joyful",
      "romantic",
      "motivational",
      "other"
    ],
    default: "other",
    select: false
  },

  // Only the bcrypt hash is stored
  privateEmotionPasswordHash: {
    type: String,
    required: true,
    select: false
  },

  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Influencer who accepted the challenge
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  // Date when influencer accepted the challenge
  acceptedAt: {
    type: Date,
    default: null
  },

  status: {
    type: String,
    enum: ["submitted", "active", "completed", "expired"],
    default: "active"
  },

  activatedAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date,
    default: function () {
      return new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      );
    }
  },

  // Public Instagram video link
  instagramUrl: {
    type: String,
    default: ""
  },

  completedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

// Index for challenge and influencer queries
challengeSchema.index({
  status: 1,
  expiresAt: 1,
  acceptedBy: 1
});

export default mongoose.model("Challenge", challengeSchema);