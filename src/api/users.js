const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
router.post(
  "/",
  [
    check("name", "name should not be empty"),
    check("password", "password characters should not be less than 6").isLength(
      {
        min: 6
      }
    ),
    check("email", "email should not be empty").isEmail()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send("user route");
  }
);

module.exports = router;
