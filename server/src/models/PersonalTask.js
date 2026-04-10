const mongoose = require("mongoose");

const PersonalTaskItemSchema = new mongoose.Schema(
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
  },
  { _id: true }
);

const PersonalTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    tasks: {
      type: [PersonalTaskItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PersonalTask", PersonalTaskSchema);