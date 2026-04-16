const dayjs = require("dayjs");
const DailyEntry = require("../models/DailyEntry");
const {
  calculateCompletionPercentage,
  getOrCreateDailyEntry,
} = require("../services/dailyService");

const sortTasksInEntry = (entry) => {
  entry.tasks = entry.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  return entry;
};

const getDailyEntryByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const parsed = dayjs(date);

    if (!parsed.isValid()) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const entry = await getOrCreateDailyEntry({
      userId: req.user._id,
      date,
    });

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createDailyEntry = async (req, res) => {
  try {
    const { date, tasks = [] } = req.body;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const existingEntry = await DailyEntry.findOne({ userId: req.user._id, date });

    if (existingEntry) {
      return res.status(409).json({ message: "Daily entry already exists" });
    }

    const normalizedTasks = tasks
      .filter((task) => task && typeof task.text === "string" && task.text.trim())
      .map((task, index) => ({
        text: task.text.trim(),
        done: !!task.done,
        status: task.done ? "completed" : "active",
        movedToDate: null,
        type: task.type,
        sourceTaskId: task.sourceTaskId || null,
        carryOver: !!task.carryOver,
        order: index + 1,
      }));

    const completionPercentage = calculateCompletionPercentage(normalizedTasks);

    const entry = await DailyEntry.create({
      userId: req.user._id,
      date,
      tasks: normalizedTasks,
      completionPercentage,
      summary: "",
      endOfDayProcessed: false,
      endOfDayAction: null,
      isClosed: false,
      closedAt: null,
    });

    return res.status(201).json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateDailyTaskStatus = async (req, res) => {
  try {
    const { entryId, taskId } = req.params;
    const { done } = req.body;

    const entry = await DailyEntry.findOne({
      _id: entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    if (entry.isClosed) {
      return res.status(400).json({ message: "This day is already closed" });
    }

    const task = entry.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "moved") {
      return res.status(400).json({ message: "Moved tasks cannot be edited" });
    }

    task.done = !!done;
    task.status = task.done ? "completed" : "active";
    task.movedToDate = null;

    entry.completionPercentage = calculateCompletionPercentage(entry.tasks);

    await entry.save();

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addExtraTask = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { text, scheduledTime, estimatedDuration } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const entry = await DailyEntry.findOne({
      _id: entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    if (entry.isClosed) {
      return res.status(400).json({ message: "This day is already closed" });
    }

    entry.tasks.push({
      text: text.trim(),
      done: false,
      status: "active",
      movedToDate: null,
      type: "extra",
      sourceTaskId: null,
      carryOver: false,
      order: entry.tasks.length + 1,
      scheduledTime: scheduledTime || null,
      estimatedDuration: estimatedDuration ? Number(estimatedDuration) : null,
    });

    entry.completionPercentage = calculateCompletionPercentage(entry.tasks);

    await entry.save();

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateExtraTask = async (req, res) => {
  try {
    const { entryId, taskId } = req.params;
    const { text, scheduledTime, estimatedDuration } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const entry = await DailyEntry.findOne({
      _id: entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    if (entry.isClosed) {
      return res.status(400).json({ message: "This day is already closed" });
    }

    const task = entry.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.type !== "extra") {
      return res.status(400).json({ message: "Only extra tasks can be edited here" });
    }

    if (task.status === "moved") {
      return res.status(400).json({ message: "Moved tasks cannot be edited" });
    }

    task.text = text.trim();
    if (scheduledTime !== undefined) task.scheduledTime = scheduledTime || null;
    if (estimatedDuration !== undefined) task.estimatedDuration = estimatedDuration ? Number(estimatedDuration) : null;

    await entry.save();

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteExtraTask = async (req, res) => {
  try {
    const { entryId, taskId } = req.params;

    const entry = await DailyEntry.findOne({
      _id: entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    if (entry.isClosed) {
      return res.status(400).json({ message: "This day is already closed" });
    }

    const task = entry.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.type !== "extra") {
      return res.status(400).json({ message: "Only extra tasks can be deleted here" });
    }

    entry.tasks.pull(taskId);

    entry.tasks.forEach((task, index) => {
      task.order = index + 1;
    });

    entry.completionPercentage = calculateCompletionPercentage(entry.tasks);

    await entry.save();

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateDailySummary = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { summary } = req.body;

    const entry = await DailyEntry.findOne({
      _id: entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    if (entry.isClosed) {
      return res.status(400).json({ message: "This day is already closed" });
    }

    entry.summary = typeof summary === "string" ? summary.trim() : "";
    await entry.save();

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const processEndOfDay = async (req, res) => {
  try {
    const { date, action, summary } = req.body;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    if (!["carryOver", "delete"].includes(action)) {
      return res.status(400).json({
        message: 'action must be either "carryOver" or "delete"',
      });
    }

    const currentEntry = await DailyEntry.findOne({
      userId: req.user._id,
      date,
    });

    if (!currentEntry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    if (currentEntry.isClosed || currentEntry.endOfDayProcessed) {
      return res.status(409).json({
        message: "This day has already been closed",
      });
    }

    if (typeof summary === "string") {
      currentEntry.summary = summary.trim();
    }

    const incompleteTasks = currentEntry.tasks.filter(
      (task) => !task.done && (task.status || "active") !== "moved"
    );

    if (action === "delete") {
      currentEntry.endOfDayProcessed = true;
      currentEntry.endOfDayAction = "delete";
      currentEntry.isClosed = true;
      currentEntry.closedAt = new Date();

      await currentEntry.save();

      return res.json({
        message: "Incomplete tasks were not carried forward",
        movedCount: 0,
        deletedCount: incompleteTasks.length,
        currentEntry: sortTasksInEntry(currentEntry),
      });
    }

    const nextDate = dayjs(date).add(1, "day").format("YYYY-MM-DD");

    let nextEntry = await DailyEntry.findOne({
      userId: req.user._id,
      date: nextDate,
    });

    if (!nextEntry) {
      nextEntry = await getOrCreateDailyEntry({
        userId: req.user._id,
        date: nextDate,
      });
    }

    const carryOverTasks = incompleteTasks.map((task, index) => ({
      text: task.text,
      done: false,
      status: "active",
      movedToDate: null,
      type: "extra",
      sourceTaskId: null,
      carryOver: true,
      order: nextEntry.tasks.length + index + 1,
      scheduledTime: task.scheduledTime || null,
      estimatedDuration: task.estimatedDuration || null,
    }));

    nextEntry.tasks.push(...carryOverTasks);
    nextEntry.completionPercentage = calculateCompletionPercentage(nextEntry.tasks);
    await nextEntry.save();

    incompleteTasks.forEach((task) => {
      task.status = "moved";
      task.movedToDate = nextDate;
      task.done = false;
    });

    currentEntry.completionPercentage = calculateCompletionPercentage(
      currentEntry.tasks
    );
    currentEntry.endOfDayProcessed = true;
    currentEntry.endOfDayAction = "carryOver";
    currentEntry.isClosed = true;
    currentEntry.closedAt = new Date();

    await currentEntry.save();

    return res.json({
      message: "Incomplete tasks carried over to next day",
      movedCount: carryOverTasks.length,
      nextDate,
      currentEntry: sortTasksInEntry(currentEntry),
      nextEntry: sortTasksInEntry(nextEntry),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const reopenDay = async (req, res) => {
  try {
    const { entryId } = req.params;

    const entry = await DailyEntry.findOne({
      _id: entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    entry.isClosed = false;
    entry.closedAt = null;
    entry.endOfDayProcessed = false;
    entry.endOfDayAction = null;

    await entry.save();

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTaskTime = async (req, res) => {
  try {
    const { entryId, taskId } = req.params;
    const { scheduledTime, actualStart, actualEnd, actualDuration, timerStartedAt } = req.body;

    const entry = await DailyEntry.findOne({
      _id: entryId,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }

    const task = entry.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (scheduledTime !== undefined) task.scheduledTime = scheduledTime || null;
    if (actualStart !== undefined) task.actualStart = actualStart || null;
    if (actualEnd !== undefined) task.actualEnd = actualEnd || null;
    if (actualDuration !== undefined) task.actualDuration = actualDuration != null ? Number(actualDuration) : null;
    if (timerStartedAt !== undefined) task.timerStartedAt = timerStartedAt ? new Date(timerStartedAt) : null;

    await entry.save();

    return res.json(sortTasksInEntry(entry));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailyEntryByDate,
  createDailyEntry,
  updateDailyTaskStatus,
  addExtraTask,
  updateExtraTask,
  deleteExtraTask,
  updateDailySummary,
  processEndOfDay,
  reopenDay,
  updateTaskTime,
};