const express = require("express");
const router = express.Router();
const dailyController = require("../controllers/dailyController");

router.get("/:date", dailyController.getDailyEntryByDate);
router.post("/", dailyController.createDailyEntry);
router.patch("/task/:entryId/:taskId", dailyController.updateDailyTaskStatus);
router.post("/:entryId/tasks", dailyController.addExtraTask);
router.patch("/:entryId/tasks/:taskId", dailyController.updateExtraTask);
router.delete("/:entryId/tasks/:taskId", dailyController.deleteExtraTask);
router.post("/end-of-day", dailyController.processEndOfDay);

module.exports = router;