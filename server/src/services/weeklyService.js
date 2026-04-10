const dayjs = require("dayjs");
const WeeklyPlan = require("../models/WeeklyPlan");
const DailyEntry = require("../models/DailyEntry");

const getWeekStart = (date = dayjs()) => {
  const day = date.day(); // 0=Sun, 1=Mon ... 6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return date.add(diffToMonday, "day").format("YYYY-MM-DD");
};

const getWeekDateRange = (weekStart) => {
  const start = dayjs(weekStart);
  const end = start.add(6, "day");
  return {
    start: start.format("YYYY-MM-DD"),
    end: end.format("YYYY-MM-DD"),
  };
};

const calculateTaskCompletionPercentage = (tasks = []) => {
  if (!tasks.length) return 0;

  const completed = tasks.filter((task) => task.done).length;
  return Math.round((completed / tasks.length) * 100);
};

const calculateDailyConsistencyPercentage = async (weekStart) => {
  const { start, end } = getWeekDateRange(weekStart);

  const dailyEntries = await DailyEntry.find({
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  if (!dailyEntries.length) return 0;

  const total = dailyEntries.reduce(
    (sum, entry) => sum + (entry.completionPercentage || 0),
    0
  );

  return Math.round(total / dailyEntries.length);
};

const calculateWeeklyScore = (
  taskCompletionPercentage,
  dailyConsistencyPercentage
) => {
  return Math.round(
    taskCompletionPercentage * 0.7 + dailyConsistencyPercentage * 0.3
  );
};

const getOrCreateCurrentWeeklyPlan = async () => {
  const weekStart = getWeekStart();

  let weeklyPlan = await WeeklyPlan.findOne({ weekStart });

  if (!weeklyPlan) {
    weeklyPlan = await WeeklyPlan.create({
      weekStart,
      tasks: [],
      dailyCompletion: [],
      taskCompletionPercentage: 0,
      dailyConsistencyPercentage: 0,
      weeklyScore: 0,
    });
  }

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

  return weeklyPlan;
};

module.exports = {
  getWeekStart,
  getWeekDateRange,
  calculateTaskCompletionPercentage,
  calculateDailyConsistencyPercentage,
  calculateWeeklyScore,
  getOrCreateCurrentWeeklyPlan,
};