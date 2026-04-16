const express = require("express");
const dailyRoutes = require("./dailyRoutes");
const personalTaskRoutes = require("./personalTaskRoutes");
const dailyTemplateRoutes = require("./dailyTemplateRoutes");
const dailyRoutineRoutes = require("./dailyRoutineRoutes");
const weeklyRoutes = require("./weeklyRoutes");
const goalRoutes = require("./goalRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const authRoutes = require("./authRoutes");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

router.use("/auth", authRoutes);

router.use("/daily", requireAuth, dailyRoutes);
router.use("/personal-tasks", requireAuth, personalTaskRoutes);
router.use("/daily-templates", requireAuth, dailyTemplateRoutes);
router.use("/daily-routines", requireAuth, dailyRoutineRoutes);
router.use("/weekly", requireAuth, weeklyRoutes);
router.use("/goals", requireAuth, goalRoutes);
router.use("/analytics", requireAuth, analyticsRoutes);

module.exports = router;