const DailyRoutine = require("../models/DailyRoutine");

const VALID_TYPES = ["morning", "night"];

const getRoutine = async (req, res) => {
  try {
    const { type } = req.params;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: "type must be 'morning' or 'night'" });
    }

    let routine = await DailyRoutine.findOne({ userId: req.user._id, type });

    if (!routine) {
      routine = await DailyRoutine.create({ userId: req.user._id, type, tasks: [] });
    }

    routine.tasks = routine.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.json(routine);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertRoutine = async (req, res) => {
  try {
    const { type } = req.params;
    const { tasks } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: "type must be 'morning' or 'night'" });
    }

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: "tasks must be an array" });
    }

    const sanitizedTasks = tasks
      .filter((task) => task && typeof task.text === "string" && task.text.trim())
      .map((task, index) => ({
        text: task.text.trim(),
        scheduledTime: task.scheduledTime || null,
        isActive: task.isActive !== false,
        order: index + 1,
      }));

    let routine = await DailyRoutine.findOne({ userId: req.user._id, type });

    if (!routine) {
      routine = await DailyRoutine.create({
        userId: req.user._id,
        type,
        tasks: sanitizedTasks,
      });
    } else {
      routine.tasks = sanitizedTasks;
      await routine.save();
    }

    return res.json(routine);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getRoutine, upsertRoutine };
