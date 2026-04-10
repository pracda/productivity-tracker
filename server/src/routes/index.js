const express = require("express");
const dailyRoutes = require("./dailyRoutes");
const personalTaskRoutes = require("./personalTaskRoutes");
const dailyTemplateRoutes = require("./dailyTemplateRoutes");
const weeklyRoutes = require("./weeklyRoutes");
const goalRoutes = require("./goalRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

router.use("/auth", authRoutes);
router.use("/daily", dailyRoutes);
router.use("/personal-tasks", personalTaskRoutes);
router.use("/daily-templates", dailyTemplateRoutes);
router.use("/weekly", weeklyRoutes);
router.use("/goals", goalRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;