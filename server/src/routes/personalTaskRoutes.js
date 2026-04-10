const express = require("express");
const router = express.Router();
const personalTaskController = require("../controllers/personalTaskController");

router.get("/", personalTaskController.getPersonalTasks);
router.put("/", personalTaskController.updatePersonalTasks);

module.exports = router;