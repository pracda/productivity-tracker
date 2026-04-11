const express = require("express");
const router = express.Router();
const dailyTemplateController = require("../controllers/dailyTemplateController");

router.get("/:weekday", dailyTemplateController.getDailyTemplateByWeekday);
router.put("/:weekday", dailyTemplateController.upsertDailyTemplateByWeekday);

module.exports = router;