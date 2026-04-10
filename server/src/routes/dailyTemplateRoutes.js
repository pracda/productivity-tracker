const express = require("express");
const router = express.Router();
const dailyTemplateController = require("../controllers/dailyTemplateController");

router.get("/:weekday", dailyTemplateController.getTemplateByWeekday);
router.put("/:weekday", dailyTemplateController.updateTemplateByWeekday);

module.exports = router;