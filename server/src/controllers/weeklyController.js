const {
  getOrCreateCurrentWeeklyPlan,
  calculateTaskCompletionPercentage,
  calculateDailyConsistencyPercentage,
  calculateWeeklyScore,
} = require("../services/weeklyService");

const sanitizeWeeklyTasks = (tasks = []) => {
  return tasks
    .filter((task) => task && typeof task.text === "string" && task.text.trim())
    .map((task, index) => ({
      text: task.text.trim(),
      done: !!task.done,
      order: index + 1,
    }));
};

const recalculateAndSave = async (weeklyPlan, userId) => {
  weeklyPlan.tasks = weeklyPlan.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));

  weeklyPlan.taskCompletionPercentage = calculateTaskCompletionPercentage(
    weeklyPlan.tasks
  );

  weeklyPlan.dailyConsistencyPercentage =
    await calculateDailyConsistencyPercentage(userId, weeklyPlan.weekStart);

  weeklyPlan.weeklyScore = calculateWeeklyScore(
    weeklyPlan.taskCompletionPercentage,
    weeklyPlan.dailyConsistencyPercentage
  );

  await weeklyPlan.save();
  return weeklyPlan;
};

const getCurrentWeeklyPlan = async (req, res) => {
  try {
    const weeklyPlan = await getOrCreateCurrentWeeklyPlan(req.user._id);
    weeklyPlan.tasks = weeklyPlan.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    return res.json(weeklyPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateWeeklyTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "tasks must be an array" });
    }

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan(req.user._id);
    weeklyPlan.tasks = sanitizeWeeklyTasks(tasks);

    await recalculateAndSave(weeklyPlan, req.user._id);

    return res.json(weeklyPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateWeeklyTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { done } = req.body;

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan(req.user._id);
    const task = weeklyPlan.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Weekly task not found" });
    }

    task.done = !!done;

    await recalculateAndSave(weeklyPlan, req.user._id);

    return res.json(weeklyPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addWeeklyTask = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan(req.user._id);

    weeklyPlan.tasks.push({
      text: text.trim(),
      done: false,
      order: weeklyPlan.tasks.length + 1,
    });

    await recalculateAndSave(weeklyPlan, req.user._id);

    return res.json(weeklyPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateWeeklyTaskText = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan(req.user._id);
    const task = weeklyPlan.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Weekly task not found" });
    }

    task.text = text.trim();

    await recalculateAndSave(weeklyPlan, req.user._id);

    return res.json(weeklyPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteWeeklyTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan(req.user._id);
    const task = weeklyPlan.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Weekly task not found" });
    }

    weeklyPlan.tasks.pull(taskId);

    weeklyPlan.tasks.forEach((task, index) => {
      task.order = index + 1;
    });

    await recalculateAndSave(weeklyPlan, req.user._id);

    return res.json(weeklyPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCurrentWeeklyPlan,
  updateWeeklyTasks,
  updateWeeklyTaskStatus,
  addWeeklyTask,
  updateWeeklyTaskText,
  deleteWeeklyTask,
};