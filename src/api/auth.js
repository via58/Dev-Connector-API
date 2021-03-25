const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const Authmiddleware = require("../../middleware/Auth");
const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// GET method
// auth route
// /api/auth
router.get("/", Authmiddleware, async (req, res) => {
  try {
    console.log(req.user);
    const user = await UserModel.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status("500").json({ msg: "Server Error" });
  }
});
router.post(
  "/",
  [
    check("email", "email should be valid").isEmail(),
    check("password", "please enter the password").exists()
  ],
  async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await UserModel.findOne({ email });
      //login and return jwt token
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ msg: "User name does not match" });
      }
      const payload = {
        user: user.id
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(401).json({ msg: "invalid user " });
    }
  }
);
module.exports = router;
