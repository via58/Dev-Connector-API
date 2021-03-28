const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../../middleware/Auth");
const { check, validationResult } = require("express-validator");
const ProfileModel = require("../models/Profile");
const User = require("../models/User");

router.get("/me", [AuthMiddleware], async (req, res) => {
  try {
    let profiles = await ProfileModel.findOne({
      user: req.user
    }).populate("user", ["name", "avatars"]);
    if (!profiles) {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.json(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

//@method POST   profiles
//@access private
//@desc   post and update  all profile and users

router.post(
  "/",
  [
    AuthMiddleware,
    [
      check("status", "status should not be empty").not().isEmpty(),
      check("skills", "skills should not be empty").not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = req.body;

    let ProfileFields = {};
    ProfileFields.user = req.user;
    if (company) ProfileFields.company = company;
    if (website) ProfileFields.website = website;
    if (location) ProfileFields.location = location;
    if (status) ProfileFields.status = status;
    if (skills) {
      ProfileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    if (bio) ProfileFields.bio = bio;
    if (githubusername) ProfileFields.githubusername = githubusername;
    ProfileFields.social = {};
    if (youtube) ProfileFields.social.youtube = youtube;
    if (twitter) ProfileFields.social.twitter = twitter;
    if (facebook) ProfileFields.social.facebook = facebook;
    if (linkedin) ProfileFields.social.linkedin = linkedin;
    if (instagram) ProfileFields.social.instagram = instagram;
    console.log(req.user);
    try {
      //check profile is there or not
      let profile = await ProfileModel.findOne({ user: req.user });
      //update
      if (profile) {
        profile = await ProfileModel.findOneAndUpdate(
          { user: req.user },
          { $set: ProfileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //create
      profile = new ProfileModel(ProfileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(400).json({ msg: "profile not found" });
    }
  }
);

//@method get all profiles
//@access Public
//@desc   get all profile datas

router.get("/", async (req, res) => {
  try {
    const profiles = await ProfileModel.find().populate("user", [
      "name",
      "avatar"
    ]);

    if (profiles.length === 0) {
      return res.status(404).json({ msg: "Profile not found" });
    }
    res.json(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});
module.exports = router;
