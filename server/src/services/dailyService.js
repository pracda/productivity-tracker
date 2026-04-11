const PersonalTask = require("../models/PersonalTask");
const DailyTemplate = require("../models/DailyTemplate");
const DailyEntry = require("../models/DailyEntry");

const calculateCompletionPercentage = (tasks) => {
  const activeTasks = tasks.filter((task) => (task.status || "active") !== "moved");

  if (!activeTasks.length) return 0;

  const completedCount = activeTasks.filter(
    (task) => task.done || task.status === "completed"
  ).length;

  return Math.round((completedCount / activeTasks.length) * 100);
};

const buildDailyTasks = ({ personalTasks = [], templateTasks = [] }) => {
  const mappedPersonalTasks = personalTasks
    .filter((task) => task.isActive !== false)
    .map((task, index) => ({
      text: task.text,
      done: false,
      status: "active",
      movedToDate: null,
      type: "personal",
      sourceTaskId: task._id,
      carryOver: false,
      order: index + 1,
    }));

  const mappedTemplateTasks = templateTasks
    .filter((task) => task.isActive !== false)
    .map((task, index) => ({
      text: task.text,
      done: false,
      status: "active",
      movedToDate: null,
      type: "template",
      sourceTaskId: task._id,
      carryOver: false,
      order: mappedPersonalTasks.length + index + 1,
    }));

  return [...mappedPersonalTasks, ...mappedTemplateTasks];
};

const getOrCreateDailyEntry = async ({ userId, date, weekday }) => {
  let entry = await DailyEntry.findOne({ userId, date });

  if (entry) {
    return entry;
  }

  const personalTaskDoc = await PersonalTask.findOne({ userId });
  const dailyTemplateDoc = await DailyTemplate.findOne({ userId, weekday });

  const personalTasks = personalTaskDoc?.tasks || [];
  const templateTasks = dailyTemplateDoc?.tasks || [];

  const tasks = buildDailyTasks({ personalTasks, templateTasks });
  const completionPercentage = calculateCompletionPercentage(tasks);

  entry = await DailyEntry.create({
    userId,
    date,
    tasks,
    completionPercentage,
    endOfDayProcessed: false,
    endOfDayAction: null,
  });

  return entry;
};

module.exports = {
  calculateCompletionPercentage,
  getOrCreateDailyEntry,
};