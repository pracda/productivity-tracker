const PersonalTask = require("../models/PersonalTask");
const DailyTemplate = require("../models/DailyTemplate");

const defaultPersonalTasks = [
  { text: "Review today’s priorities", isActive: true, order: 1 },
  { text: "Exercise / movement", isActive: true, order: 2 },
  { text: "Focused learning or deep work", isActive: true, order: 3 },
];

const defaultTemplatesByWeekday = {
  0: [{ text: "Reset and prepare for the week", isActive: true, order: 1 }],
  1: [
    { text: "Plan top 3 priorities for the week", isActive: true, order: 1 },
    { text: "Review weekly goals", isActive: true, order: 2 },
  ],
  2: [{ text: "Progress check on active goals", isActive: true, order: 1 }],
  3: [{ text: "Midweek review and adjustment", isActive: true, order: 1 }],
  4: [{ text: "Push one meaningful task forward", isActive: true, order: 1 }],
  5: [
    { text: "Weekly review", isActive: true, order: 1 },
    { text: "Capture lessons and loose ends", isActive: true, order: 2 },
  ],
  6: [{ text: "Plan tomorrow and recharge", isActive: true, order: 1 }],
};

const seedDefaultPlannerIfEmpty = async (userId) => {
  const existingPersonal = await PersonalTask.findOne({ userId });
  const existingTemplates = await DailyTemplate.countDocuments({ userId });

  if (!existingPersonal) {
    await PersonalTask.create({
      userId,
      tasks: defaultPersonalTasks,
    });
  }

  if (existingTemplates === 0) {
    const docs = Object.entries(defaultTemplatesByWeekday).map(
      ([weekday, tasks]) => ({
        userId,
        weekday: Number(weekday),
        tasks,
      })
    );

    await DailyTemplate.insertMany(docs);
  }
};

module.exports = {
  seedDefaultPlannerIfEmpty,
};