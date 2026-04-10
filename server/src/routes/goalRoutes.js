const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");

router.get("/", goalController.getGoals);
router.post("/", goalController.createGoal);
router.patch("/:id", goalController.updateGoal);
router.get("/:id/history", goalController.getGoalHistory);

module.exports = router;