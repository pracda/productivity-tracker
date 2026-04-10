const DailyTemplate = require("../models/DailyTemplate");

const getTemplateByWeekday = async (req, res) => {
  try {
    const weekday = Number(req.params.weekday);

    if (Number.isNaN(weekday) || weekday < 0 || weekday > 6) {
      return res.status(400).json({ message: "weekday must be between 0 and 6" });
    }

    let template = await DailyTemplate.findOne({ weekday });

    if (!template) {
      template = await DailyTemplate.create({ weekday, tasks: [] });
    }

    return res.json(template);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTemplateByWeekday = async (req, res) => {
  try {
    const weekday = Number(req.params.weekday);
    const { tasks } = req.body;

    if (Number.isNaN(weekday) || weekday < 0 || weekday > 6) {
      return res.status(400).json({ message: "weekday must be between 0 and 6" });
    }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "tasks must be an array" });
    }

    let template = await DailyTemplate.findOne({ weekday });

    if (!template) {
      template = new DailyTemplate({ weekday, tasks: [] });
    }

    template.tasks = tasks;
    await template.save();

    return res.json(template);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTemplateByWeekday,
  updateTemplateByWeekday,
};