const mongoose = require("mongoose");

const GoalMilestoneSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
    achievedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["monthly", "sixMonth"],
      required: true,
    },
    targetDate: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    milestones: {
      type: [GoalMilestoneSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", GoalSchema);