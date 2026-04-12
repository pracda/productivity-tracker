const express = require("express");
const router = express.Router();
const weeklyController = require("../controllers/weeklyController");

router.get("/current", weeklyController.getCurrentWeeklyPlan);
router.put("/tasks", weeklyController.updateWeeklyTasks);
router.post("/tasks", weeklyController.addWeeklyTask);
router.patch("/tasks/:taskId/status", weeklyController.updateWeeklyTaskStatus);
router.patch("/tasks/:taskId", weeklyController.updateWeeklyTaskText);
router.delete("/tasks/:taskId", weeklyController.deleteWeeklyTask);

module.exports = router;