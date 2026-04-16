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

const syncTemplatesToEntry = async ({ userId, date }) => {
  let entry = await DailyEntry.findOne({ userId, date });

  if (!entry) {
    return getOrCreateDailyEntry({ userId, date });
  }

  const [personalTaskDoc, morningRoutineDoc, nightRoutineDoc] = await Promise.all([
    PersonalTask.findOne({ userId }),
    DailyRoutine.findOne({ userId, type: "morning" }),
    DailyRoutine.findOne({ userId, type: "night" }),
  ]);

  const freshPersonal = (personalTaskDoc?.tasks || []).filter((t) => t.isActive !== false);
  const freshMorning  = (morningRoutineDoc?.tasks || []).filter((t) => t.isActive !== false);
  const freshNight    = (nightRoutineDoc?.tasks   || []).filter((t) => t.isActive !== false);

  // For a given type: keep tasks already completed, replace all undone ones
  // with the fresh template list.
  const syncType = (existingTasks, freshTasks, type) => {
    const completed = existingTasks.filter(
      (t) => t.type === type && (t.done || t.status === "completed")
    );
    const fresh = freshTasks.map((t) => ({
      text: t.text,
      done: false,
      status: "active",
      movedToDate: null,
      type,
      sourceTaskId: t._id,
      carryOver: false,
      scheduledTime: t.scheduledTime || null,
      estimatedDuration: t.estimatedDuration || null,
      order: 0,
    }));
    return [...completed, ...fresh];
  };

  // Tasks that are NOT template-driven stay exactly as they are.
  const kept = entry.tasks.filter(
    (t) => t.type === "extra" || t.type === "template" || t.status === "moved"
  );

  const merged = [
    ...syncType(entry.tasks, freshMorning,  "morning"),
    ...syncType(entry.tasks, freshPersonal, "personal"),
    ...syncType(entry.tasks, freshNight,    "night"),
    ...kept,
  ];

  // Re-assign stable order.
  merged.forEach((t, i) => { t.order = i + 1; });

  entry.tasks = merged;
  entry.completionPercentage = calculateCompletionPercentage(entry.tasks);
  await entry.save();

  entry.tasks = entry.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  return entry;
};

module.exports = {
  calculateCompletionPercentage,
  getOrCreateDailyEntry,
  syncTemplatesToEntry,
};
