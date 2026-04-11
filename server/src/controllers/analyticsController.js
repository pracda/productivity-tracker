const dayjs = require("dayjs");
const DailyEntry = require("../models/DailyEntry");
const WeeklyPlan = require("../models/WeeklyPlan");

const getAnalytics = async (req, res) => {
  try {
    const last30Days = dayjs().subtract(29, "day").format("YYYY-MM-DD");

    const dailyEntries = await DailyEntry.find({
      userId: req.user._id,
      date: { $gte: last30Days },
    }).sort({ date: 1 });

    const weeklyPlans = await WeeklyPlan.find({
      userId: req.user._id,
    }).sort({ weekStart: 1 });

    const dailyTrend = dailyEntries.map((entry) => ({
      date: entry.date,
      completionPercentage: entry.completionPercentage || 0,
    }));

    const weeklyTrend = weeklyPlans.map((plan) => ({
      weekStart: plan.weekStart,
      weeklyScore: plan.weeklyScore || 0,
      taskCompletionPercentage: plan.taskCompletionPercentage || 0,
      dailyConsistencyPercentage: plan.dailyConsistencyPercentage || 0,
    }));

    const successThreshold = 70;

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const successfulDays = dailyEntries.map((entry) => ({
      date: entry.date,
      success: (entry.completionPercentage || 0) >= successThreshold,
      completionPercentage: entry.completionPercentage || 0,
    }));

    for (let i = 0; i < successfulDays.length; i++) {
      if (successfulDays[i].success) {
        tempStreak += 1;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    for (let i = successfulDays.length - 1; i >= 0; i--) {
      if (successfulDays[i].success) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    const successDaysCount = successfulDays.filter((day) => day.success).length;
    const missedDaysCount = successfulDays.filter(
      (day) => day.completionPercentage === 0
    ).length;
    const bestDailyCompletion = successfulDays.length
      ? Math.max(...successfulDays.map((day) => day.completionPercentage))
      : 0;

    const averageWeeklyScore = weeklyTrend.length
      ? Math.round(
          weeklyTrend.reduce((sum, week) => sum + (week.weeklyScore || 0), 0) /
            weeklyTrend.length
        )
      : 0;

    const taskCompositionCounts = {
      personal: 0,
      template: 0,
      extra: 0,
      carryOver: 0,
    };

    dailyEntries.forEach((entry) => {
      entry.tasks.forEach((task) => {
        if (task.carryOver) {
          taskCompositionCounts.carryOver += 1;
        } else if (task.type === "personal") {
          taskCompositionCounts.personal += 1;
        } else if (task.type === "template") {
          taskCompositionCounts.template += 1;
        } else if (task.type === "extra") {
          taskCompositionCounts.extra += 1;
        }
      });
    });

    const taskComposition = [
      { name: "Personal", value: taskCompositionCounts.personal },
      { name: "Template", value: taskCompositionCounts.template },
      { name: "Extra", value: taskCompositionCounts.extra },
      { name: "Carry Over", value: taskCompositionCounts.carryOver },
    ].filter((item) => item.value > 0);

    return res.json({
      dailyTrend,
      weeklyTrend,
      streaks: {
        currentStreak,
        bestStreak,
        successThreshold,
      },
      summary: {
        successDaysCount,
        missedDaysCount,
        bestDailyCompletion,
        averageWeeklyScore,
      },
      taskComposition,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
};