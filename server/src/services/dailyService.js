const PersonalTask = require("../models/PersonalTask");
const DailyRoutine = require("../models/DailyRoutine");
const DailyEntry = require("../models/DailyEntry");

const calculateCompletionPercentage = (tasks) => {
  const activeTasks = tasks.filter((task) => (task.status || "active") !== "moved");

  if (!activeTasks.length) return 0;

  const completedCount = activeTasks.filter(
    (task) => task.done || task.status === "completed"
  ).length;

  return Math.round((completedCount / activeTasks.length) * 100);
};

const buildDailyTasks = ({ morningTasks = [], personalTasks = [], nightTasks = [] }) => {
  let order = 1;

  const mapTasks = (tasks, type) =>
    tasks
      .filter((task) => task.isActive !== false)
      .map((task) => ({
        text: task.text,
        done: false,
        status: "active",
        movedToDate: null,
        type,
        sourceTaskId: task._id,
        carryOver: false,
        order: order++,
        scheduledTime: task.scheduledTime || null,
        estimatedDuration: task.estimatedDuration || null,
      }));

  return [
    ...mapTasks(morningTasks, "morning"),
    ...mapTasks(personalTasks, "personal"),
    ...mapTasks(nightTasks, "night"),
  ];
};

const getOrCreateDailyEntry = async ({ userId, date }) => {
  let entry = await DailyEntry.findOne({ userId, date });

  if (entry) {
    return entry;
  }

  const [personalTaskDoc, morningRoutineDoc, nightRoutineDoc] = await Promise.all([
    PersonalTask.findOne({ userId }),
    DailyRoutine.findOne({ userId, type: "morning" }),
    DailyRoutine.findOne({ userId, type: "night" }),
  ]);

  const personalTasks = personalTaskDoc?.tasks || [];
  const morningTasks = morningRoutineDoc?.tasks || [];
  const nightTasks = nightRoutineDoc?.tasks || [];

  const tasks = buildDailyTasks({ morningTasks, personalTasks, nightTasks });
  const completionPercentage = calculateCompletionPercentage(tasks);

  entry = await DailyEntry.create({
    userId,
    date,
    tasks,
    completionPercentage,
    summary: "",
    endOfDayProcessed: false,
    endOfDayAction: null,
    isClosed: false,
    closedAt: null,
  });

  return entry;
};

module.exports = {
  calculateCompletionPercentage,
  getOrCreateDailyEntry,
};
