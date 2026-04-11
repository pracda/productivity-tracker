const PersonalTask = require("../models/PersonalTask");

const getPersonalTasks = async (req, res) => {
  try {
    let doc = await PersonalTask.findOne({ userId: req.user._id });

    if (!doc) {
      doc = await PersonalTask.create({
        userId: req.user._id,
        tasks: [],
      });
    }

    doc.tasks = doc.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.json(doc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePersonalTasks = async (req, res) => {
  try {
    const { tasks } = req.body;

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

    let doc = await PersonalTask.findOne({ userId: req.user._id });

    if (!doc) {
      doc = await PersonalTask.create({
        userId: req.user._id,
        tasks: sanitizedTasks,
      });
    } else {
      doc.tasks = sanitizedTasks;
      await doc.save();
    }

    return res.json(doc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPersonalTasks,
  updatePersonalTasks,
};