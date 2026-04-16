const mongoose = require("mongoose");

const DailyRoutineTaskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    scheduledTime: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const DailyRoutineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["morning", "night"],
      required: true,
    },
    tasks: {
      type: [DailyRoutineTaskSchema],
      default: [],
    },
  },
  { timestamps: true }
);

DailyRoutineSchema.index({ userId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("DailyRoutine", DailyRoutineSchema);
