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
    }).populate("User", ["name", "avatars"]);
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
    const profiles = await ProfileModel.find().populate("User", [
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

//@method get  profiles by Id
//@access Public
//@desc   get  profile data by Id

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({
      user: req.params.user_id
    }).populate("User", ["name", "avatar"]);
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@method get  profiles by token
//@access private
//@desc   get  profile data by token

router.delete("/", AuthMiddleware, async (req, res) => {
  try {
    // Delete profile
    await ProfileModel.findOneAndRemove({ user: req.user });
    //Delete User
    await User.findOneAndRemove({ _id: req.user });

    //to-do delete respective post

    res.json("Profile deleted");
  } catch (err) {
    console.log(err.message);
    res.status(500).send(" Server Error");
  }
});

//@method put  profile experience by token
//@access private
//@desc   put  profile experience data by token

router.put(
  "/experience",
  [
    AuthMiddleware,
    [
      check("title", "title should not be empty").not().isEmpty(),
      check("from", "from date should be valid").not().isEmpty(),
      check("company", "company name should not be empty").not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
      } = req.body;
      // get profile
      const profile = await ProfileModel.findOne({ user: req.user });
      //add experience
      const experienceObject = {
        title: title,
        company: company,
        location: location,
        from: from,
        to: to,
        current: current,
        description: description
      };

      profile.experience.unshift(experienceObject);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send(" Server Error");
    }
  }
);

//@method delete  profiles Experience by experience id
//@access private
//@desc   delete  profiles Experience by experience id

router.delete("/experience/:exp_id", AuthMiddleware, async (req, res) => {
  try {
    // get profile
    const profile = await ProfileModel.findOne({ user: req.user });

    //get index of specific experience
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    // remove expereince from profile
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(" Server Error");
  }
});

//@method put  profile Education by token
//@access private
//@desc   put  profile Education data by token

router.put(
  "/education",
  [
    AuthMiddleware,
    [
      check("school", "school name should not be empty").not().isEmpty(),
      check("from", "from date should be valid").not().isEmpty(),
      check("degree", "degree of study should not be empty").not().isEmpty(),

      check("fieldofstudy", "field of study should not be empty")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
      // get profile
      const profile = await ProfileModel.findOne({ user: req.user });
      //add education
      const educationObject = {
        school: school,
        degree: degree,
        fieldofstudy: fieldofstudy,
        from: from,
        to: to,
        current: current,
        description: description
      };

      profile.education.unshift(educationObject);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send(" Server Error");
    }
  }
);

//@method delete  profiles Education by experience id
//@access private
//@desc   delete  profiles Education by experience id

router.delete("/education/:edu_id", AuthMiddleware, async (req, res) => {
  try {
    // get profile
    const profile = await ProfileModel.findOne({ user: req.user });

    //get index of specific experience
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    // remove education from profile
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send(" Server Error");
  }
});

module.exports = router;
