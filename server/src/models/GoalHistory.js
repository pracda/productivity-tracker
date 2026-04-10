const mongoose = require("mongoose");

const GoalChangeSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const GoalHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changes: {
      type: [GoalChangeSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoalHistory", GoalHistorySchema);