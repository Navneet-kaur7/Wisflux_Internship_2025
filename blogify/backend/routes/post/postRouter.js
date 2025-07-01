const express = require("express");
const multer = require("multer");
const {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  getPublicPosts,
  likePost,
  disLikePost,
  claps,
  schedule,
  postViewCount,
} = require("../../controllers/posts/posts");

const isLoggin = require("../../middlewares/isLoggin");
const storage = require("../../utils/fileUpload");

const postsRouter = express.Router();
//! file upload middleware

const upload = multer({ storage });

//create
postsRouter.post("/", isLoggin, upload.single("image"), createPost);

//getting all posts (private)
postsRouter.get("/", isLoggin, getPosts);

// ✅ IMPORTANT: Put specific routes BEFORE parameterized routes
//get only 4 posts (public) - This must come before /:id route
postsRouter.get("/public", getPublicPosts);

//like post - specific route, comes before /:id
postsRouter.put("/likes/:id", isLoggin, likePost);

//schedule post - specific route, comes before /:id
postsRouter.put("/schedule/:postId", isLoggin, schedule);

//dislike post - specific route, comes before /:id
postsRouter.put("/dislikes/:id", isLoggin, disLikePost);

//clap a post - specific route, comes before /:id
postsRouter.put("/claps/:id", isLoggin, claps);

//update post view count - specific route, comes before /:id
postsRouter.put("/:id/post-view-count", isLoggin, postViewCount);

// ✅ Parameterized routes should come AFTER all specific routes
//get single post - this should come after all specific routes
postsRouter.get("/:id", getPost);

//update post - parameterized route
postsRouter.put("/:id", isLoggin, upload.single("image"), updatePost);

//delete post - parameterized route
postsRouter.delete("/:id", isLoggin, deletePost);

module.exports = postsRouter;