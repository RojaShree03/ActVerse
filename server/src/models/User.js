
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  passwordHash: {
    type: String,
    required: true,
    select: false
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  // User role
  role: {
    type: String,
    enum: ["fan", "influencer", "admin"],
    default: "fan"
  },

  // Influencer account approval
  influencerStatus: {
    type: String,
    enum: [
      "not_requested",
      "pending",
      "approved",
      "rejected"
    ],
    default: "not_requested"
  },

  influencerRequestedAt: {
    type: Date,
    default: null
  },

  influencerApprovedAt: {
    type: Date,
    default: null
  },

  influencerApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  preferredLanguage: {
    type: String,
    enum: ["en", "ta"],
    default: "en"
  },

  acceptedRulesVersion: {
    type: String,
    default: ""
  },

  acceptedRulesAt: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  lastLoginAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

// Find pending influencer applications easily
userSchema.index({
  role: 1,
  influencerStatus: 1
});

export default mongoose.model("User", userSchema);
