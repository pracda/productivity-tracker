const mongoose = require("mongoose");

const WeeklyTaskSchema = new mongoose.Schema(
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
    order: {
      type: Number,
      default: 0,
    },
    scheduledTime: {
      type: String,
      default: null,
    },
    estimatedDuration: {
      type: Number,
      default: null,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: null,
    },
  },
  { _id: true }
);

const WeeklyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    weekStart: {
      type: String,
      required: true,
    },
    tasks: {
      type: [WeeklyTaskSchema],
      default: [],
    },
    dailyCompletion: {
      type: [Number],
      default: [],
    },
    taskCompletionPercentage: {
      type: Number,
      default: 0,
    },
    dailyConsistencyPercentage: {
      type: Number,
      default: 0,
    },
    weeklyScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

WeeklyPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyPlan", WeeklyPlanSchema);