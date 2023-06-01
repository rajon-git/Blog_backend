const express=require("express");
const router=express.Router();
const {
    create,
  fetchPosts,
  fetchPost,
  update,
  deletePost,
  LikeToPost,
  DislikeToPost,
} = require("../controllers/postCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/post/",authMiddleware,create);

router.put("/post/likes", authMiddleware, LikeToPost);
router.put("/post/dislikes", authMiddleware, DislikeToPost);
router.get("/post", fetchPosts);
router.get("/post/:id", fetchPost);
router.put("/post/:id", authMiddleware, update);
router.delete("/post/:id", authMiddleware, deletePost);

module.exports = router;
