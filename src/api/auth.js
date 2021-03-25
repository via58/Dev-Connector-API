const express = require("express");
const router = express.Router();
const Authmiddleware = require("../../middleware/Auth");

// GET method
// auth route
// /api/auth
router.get("/", Authmiddleware, (req, res) => {
  res.send("Auth route");
});
module.exports = router;
