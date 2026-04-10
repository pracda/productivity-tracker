const {
  getOrCreateCurrentWeeklyPlan,
  calculateTaskCompletionPercentage,
  calculateDailyConsistencyPercentage,
  calculateWeeklyScore,
} = require("../services/weeklyService");

const getCurrentWeeklyPlan = async (req, res) => {
  try {
    const weeklyPlan = await getOrCreateCurrentWeeklyPlan();
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

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan();

    weeklyPlan.tasks = tasks.map((task, index) => ({
      text: task.text,
      done: !!task.done,
      order: task.order ?? index + 1,
    }));

    weeklyPlan.taskCompletionPercentage = calculateTaskCompletionPercentage(
      weeklyPlan.tasks
    );

    weeklyPlan.dailyConsistencyPercentage =
      await calculateDailyConsistencyPercentage(weeklyPlan.weekStart);

    weeklyPlan.weeklyScore = calculateWeeklyScore(
      weeklyPlan.taskCompletionPercentage,
      weeklyPlan.dailyConsistencyPercentage
    );

    await weeklyPlan.save();

    return res.json(weeklyPlan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateWeeklyTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { done } = req.body;

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan();
    const task = weeklyPlan.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Weekly task not found" });
    }

    task.done = done;

    weeklyPlan.taskCompletionPercentage = calculateTaskCompletionPercentage(
      weeklyPlan.tasks
    );

    weeklyPlan.dailyConsistencyPercentage =
      await calculateDailyConsistencyPercentage(weeklyPlan.weekStart);

    weeklyPlan.weeklyScore = calculateWeeklyScore(
      weeklyPlan.taskCompletionPercentage,
      weeklyPlan.dailyConsistencyPercentage
    );

    await weeklyPlan.save();

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

    const weeklyPlan = await getOrCreateCurrentWeeklyPlan();

    weeklyPlan.tasks.push({
      text: text.trim(),
      done: false,
      order: weeklyPlan.tasks.length + 1,
    });

    weeklyPlan.taskCompletionPercentage = calculateTaskCompletionPercentage(
      weeklyPlan.tasks
    );

    weeklyPlan.dailyConsistencyPercentage =
      await calculateDailyConsistencyPercentage(weeklyPlan.weekStart);

    weeklyPlan.weeklyScore = calculateWeeklyScore(
      weeklyPlan.taskCompletionPercentage,
      weeklyPlan.dailyConsistencyPercentage
    );

    await weeklyPlan.save();

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
};