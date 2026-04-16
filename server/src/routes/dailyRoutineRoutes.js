const express = require("express");
const router = express.Router();
const { getRoutine, upsertRoutine } = require("../controllers/dailyRoutineController");

router.get("/:type", getRoutine);
router.put("/:type", upsertRoutine);

module.exports = router;
