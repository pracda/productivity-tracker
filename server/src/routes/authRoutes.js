const express = require("express");
const router = express.Router();

router.get("/status", (req, res) => {
  return res.json({
    authenticated: false,
    message: "Auth not implemented yet",
  });
});

module.exports = router;