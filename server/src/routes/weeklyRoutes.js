const express = require("express");
const router = express.Router();
const weeklyController = require("../controllers/weeklyController");

router.get("/current", weeklyController.getCurrentWeeklyPlan);
router.put("/", weeklyController.updateWeeklyTasks);
router.patch("/task/:taskId", weeklyController.updateWeeklyTaskStatus);
router.post("/tasks", weeklyController.addWeeklyTask);

module.exports = router;