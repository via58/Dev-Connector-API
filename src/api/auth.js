const express = require("express");
const router = express.Router();

// GET method
// auth route
// /api/auth
router.get("/", (req, res) => {
  res.send("Auth route");
});
module.exports = router;
