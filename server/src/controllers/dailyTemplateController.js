const DailyTemplate = require("../models/DailyTemplate");

const getDailyTemplateByWeekday = async (req, res) => {
  try {
    const weekday = Number(req.params.weekday);

    if (Number.isNaN(weekday) || weekday < 0 || weekday > 6) {
      return res.status(400).json({ message: "weekday must be between 0 and 6" });
    }

    let template = await DailyTemplate.findOne({
      userId: req.user._id,
      weekday,
    });

    if (!template) {
      template = await DailyTemplate.create({
        userId: req.user._id,
        weekday,
        tasks: [],
      });
    }

    template.tasks = template.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.json(template);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertDailyTemplateByWeekday = async (req, res) => {
  try {
    const weekday = Number(req.params.weekday);
    const { tasks } = req.body;

    if (Number.isNaN(weekday) || weekday < 0 || weekday > 6) {
      return res.status(400).json({ message: "weekday must be between 0 and 6" });
    }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "tasks must be an array" });
    }

    const sanitizedTasks = tasks
      .filter((task) => task && typeof task.text === "string" && task.text.trim())
      .map((task, index) => ({
        text: task.text.trim(),
        isActive: task.isActive !== false,
        order: index + 1,
      }));

    let template = await DailyTemplate.findOne({
      userId: req.user._id,
      weekday,
    });

    if (!template) {
      template = await DailyTemplate.create({
        userId: req.user._id,
        weekday,
        tasks: sanitizedTasks,
      });
    } else {
      template.tasks = sanitizedTasks;
      await template.save();
    }

    return res.json(template);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyTemplateByWeekday,
  upsertDailyTemplateByWeekday,
};