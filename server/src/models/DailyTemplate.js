const mongoose = require("mongoose");

const DailyTemplateTaskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  },
  { _id: true }
);

const DailyTemplateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    weekday: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    tasks: {
      type: [DailyTemplateTaskSchema],
      default: [],
    },
  },
  { timestamps: true }
);

DailyTemplateSchema.index({ userId: 1, weekday: 1 }, { unique: true });

module.exports = mongoose.model("DailyTemplate", DailyTemplateSchema);