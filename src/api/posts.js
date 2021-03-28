const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const AuthMiddleware = require("../../middleware/Auth");
const UserModel = require("../models/User");
const PostModel = require("../models/Post");

//@method GET   api/posts
//@access private
//@desc   get all post
router.get("/", [AuthMiddleware], async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});
//@method GET   api/posts/id
//@access private
//@desc   get  post by id
router.get("/:id", [AuthMiddleware], async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).sort({ date: -1 });
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).json("Server Error");
  }
});
//@method POST   api/posts
//@access private
//@desc   post the posts
router.post(
  "/",
  [AuthMiddleware, [check("text", "text should not be empty").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const User = await UserModel.findById(req.user).select("-password");

      const newPosts = new PostModel({
        user: req.user,
        text: req.body.text,
        name: User.name,
        avatar: User.avatar
      });
      const post = await newPosts.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).json("Server Error");
    }
  }
);

//@method DELETE   api/posts/id
//@access private
//@desc   delete  post by id
router.delete("/:id", [AuthMiddleware], async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    //User check
    if (post.user.toString() !== req.user) {
      return res
        .status(401)
        .json({ msg: "User not authorized to delete this post" });
    }
    await post.remove();
    res.json("Post removed");
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

//@method PUT   api/posts/like/id
//@access private
//@desc   like the  post
router.put("/like/:id", [AuthMiddleware], async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    //Check whether the post is already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user).length > 0
    ) {
      return res.status(400).json({ msg: "Post is already liked" });
    }
    post.likes.unshift({ user: req.user });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});

//@method PUT   api/posts/unlike/id
//@access private
//@desc   unlike the  post
router.put("/unlike/:id", [AuthMiddleware], async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    //Check whether the post is already liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user).length ===
      0
    ) {
      return res.status(400).json({ msg: "Post is not liked yet" });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});
module.exports = router;
