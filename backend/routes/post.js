const express = require("express");
const protectRoute = require("../middlewares/protectRoute");
const {createPost, likeUnlikePost, commentPost, deletePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts} = require("../controllers/postController")

const router = express.Router()

router.get("/all", protectRoute, getAllPosts)
router.get("/following", protectRoute, getFollowingPosts)
router.get("/:username", protectRoute, getUserPosts)
router.get("/likes/:id", protectRoute, getLikedPosts)
router.post("/create", protectRoute, createPost)
router.post("/like/:id", protectRoute, likeUnlikePost)
router.post("/comment/:id", protectRoute, commentPost)
router.delete("/delete/:id", protectRoute, deletePost)

module.exports = router;