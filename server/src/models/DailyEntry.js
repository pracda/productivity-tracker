const mongoose = require("mongoose");

const DailyEntryTaskSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["active", "completed", "moved"],
      default: "active",
    },
    movedToDate: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["personal", "template", "morning", "night", "extra"],
      required: true,
    },
    sourceTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    carryOver: {
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
  },
  { _id: true }
);

const DailyEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    tasks: {
      type: [DailyEntryTaskSchema],
      default: [],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    endOfDayProcessed: {
      type: Boolean,
      default: false,
    },
    endOfDayAction: {
      type: String,
      enum: ["carryOver", "delete", null],
      default: null,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

DailyEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyEntry", DailyEntrySchema);