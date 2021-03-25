const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const UserModel = require("../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

router.post(
  "/",
  [
    check("name", "name should not be empty").not().isEmpty(),
    check("password", "password characters should not be less than 6").isLength(
      {
        min: 6
      }
    ),
    check("email", "email should not be empty").isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { name, password, email } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // check user existance
      let user = await UserModel.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "user already exists" });
      }
      //get avatar from email

      let avatar = gravatar.url(email, {
        s: "200",
        d: "pg",
        r: "mm"
      });
      let User = new UserModel({
        name,
        avatar,
        password,
        email
      });
      //password bcrypt
      let salt = await bcrypt.genSalt(10);
      User.password = await bcrypt.hash(password, salt);
      User.save();
      // return JWT token
      const payload = {
        id: User.id
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
      console.log(err);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
