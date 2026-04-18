const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authLimiter = require("../middleware/rateLimiter");

router.get("/status", authController.getAuthStatus);
router.post("/google", authLimiter, authController.googleLogin);

module.exports = router;
