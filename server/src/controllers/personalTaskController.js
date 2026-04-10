const PersonalTask = require("../models/PersonalTask");

const getPersonalTasks = async (req, res) => {
  try {
    let personalTaskDoc = await PersonalTask.findOne();

    if (!personalTaskDoc) {
      personalTaskDoc = await PersonalTask.create({ tasks: [] });
    }

    return res.json(personalTaskDoc);
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

    let personalTaskDoc = await PersonalTask.findOne();

    if (!personalTaskDoc) {
      personalTaskDoc = new PersonalTask({ tasks: [] });
    }

    personalTaskDoc.tasks = tasks;
    await personalTaskDoc.save();

    return res.json(personalTaskDoc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPersonalTasks,
  updatePersonalTasks,
};