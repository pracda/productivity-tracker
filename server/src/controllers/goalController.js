const Goal = require("../models/Goal");
const GoalHistory = require("../models/GoalHistory");

const normalizeProgress = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(100, num));
};

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(goals);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, type, targetDate, progress = 0 } = req.body;

    if (!title || !title.trim() || !type || !targetDate) {
      return res
        .status(400)
        .json({ message: "title, type, and targetDate are required" });
    }

    const normalizedProgress = normalizeProgress(progress);

    if (normalizedProgress === null) {
      return res.status(400).json({ message: "progress must be a number" });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title: title.trim(),
      type,
      targetDate,
      progress: normalizedProgress,
    });

    return res.status(201).json(goal);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, targetDate, progress } = req.body;

    const goal = await Goal.findOne({ _id: id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const changes = [];

    if (typeof title === "string" && title.trim() && title.trim() !== goal.title) {
      changes.push({
        field: "title",
        oldValue: goal.title,
        newValue: title.trim(),
      });
      goal.title = title.trim();
    }

    if (typeof type === "string" && type !== goal.type) {
      changes.push({
        field: "type",
        oldValue: goal.type,
        newValue: type,
      });
      goal.type = type;
    }

    if (typeof targetDate === "string" && targetDate !== goal.targetDate) {
      changes.push({
        field: "targetDate",
        oldValue: goal.targetDate,
        newValue: targetDate,
      });
      goal.targetDate = targetDate;
    }

    if (typeof progress !== "undefined") {
      const normalizedProgress = normalizeProgress(progress);

      if (normalizedProgress === null) {
        return res.status(400).json({ message: "progress must be a number" });
      }

      if (normalizedProgress !== goal.progress) {
        changes.push({
          field: "progress",
          oldValue: goal.progress,
          newValue: normalizedProgress,
        });
        goal.progress = normalizedProgress;
      }
    }

    await goal.save();

    if (changes.length > 0) {
      await GoalHistory.create({
        userId: req.user._id,
        goalId: goal._id,
        changedAt: new Date(),
        changes,
      });
    }

    return res.json(goal);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getGoalHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await GoalHistory.find({
      userId: req.user._id,
      goalId: id,
    }).sort({ changedAt: -1 });

    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  getGoalHistory,
};