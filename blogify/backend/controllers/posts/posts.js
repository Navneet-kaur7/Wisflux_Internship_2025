const asyncHandler = require("express-async-handler");
const Post = require("../../model/Post/Post");
const Category = require("../../model/Category/Category");
const multer = require("multer");
const storage = require("../../utils/fileUpload");

// Multer config
const upload = multer({ storage });

//@desc  Create a post
//@route POST /api/v1/posts
//@access Private

exports.createPost = [
  upload.single("image"),
  asyncHandler(async (req, res) => {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("User auth:", req.userAuth);

    const { title, content, category } = req.body;

    // Validation
    if (!title || !content || !category) {
      return res.status(400).json({
        status: "error",
        message: "Title, content, and category are required"
      });
    }

    // Check if user is authenticated
    if (!req.userAuth?._id) {
      return res.status(401).json({
        status: "error",
        message: "User not authenticated"
      });
    }

    try {
      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          status: "error",
          message: "Category does not exist"
        });
      }

      // Create post
      const postData = {
        title,
        content,
        category,
        author: req.userAuth._id,
      };

      // Add image if uploaded
      if (req.file) {
        postData.image = req.file.path;
      }

      const post = await Post.create(postData);

      // Update category to include this post
      await Category.findByIdAndUpdate(category, {
        $push: { posts: post._id }
      });

      // Populate the post with author and category details
      const populatedPost = await Post.findById(post._id)
        .populate("author", "username email")
        .populate("category", "name");

      res.status(201).json({
        status: "success",
        message: "Post created successfully",
        post: populatedPost,
      });
    } catch (error) {
      console.error("Post creation error:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to create post"
      });
    }
  })
];

//@desc  Get all posts
//@route GET /api/v1/posts
//@access Public

exports.getPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "username email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch posts"
    });
  }
});

//@desc  Get single post
//@route GET /api/v1/posts/:id
//@access Public

exports.getPost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username email")
      .populate("category", "name");

    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Post fetched successfully",
      post,
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch post"
    });
  }
});

//@desc  Update post
//@route PUT /api/v1/posts/:id
//@access Private

exports.updatePost = [
  upload.single("image"),
  asyncHandler(async (req, res) => {
    try {
      const { title, content, category } = req.body;
      
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({
          status: "error",
          message: "Post not found"
        });
      }

      // Check if user owns the post
      if (post.author.toString() !== req.userAuth._id.toString()) {
        return res.status(403).json({
          status: "error",
          message: "Not authorized to update this post"
        });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (category) updateData.category = category;
      if (req.file) updateData.image = req.file.path;

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate("author", "username email").populate("category", "name");

      res.status(200).json({
        status: "success",
        message: "Post updated successfully",
        post: updatedPost,
      });
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to update post"
      });
    }
  })
];

//@desc  Delete post
//@route DELETE /api/v1/posts/:id
//@access Private

exports.deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found"
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.userAuth._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this post"
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    // Remove post from category
    await Category.findByIdAndUpdate(post.category, {
      $pull: { posts: post._id }
    });

    res.status(200).json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to delete post"
    });
  }
});

// Add these missing functions to your posts.js controller file

//@desc  Get public posts (limited)
//@route GET /api/v1/posts/public
//@access Public
exports.getPublicPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "username email")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(4); // Limit to 4 posts for public view

    res.status(200).json({
      status: "success",
      message: "Public posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("Get public posts error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch public posts"
    });
  }
});

//@desc  Like a post
//@route PUT /api/v1/posts/likes/:id
//@access Private
exports.likePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userAuth._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found"
      });
    }

    // Check if user already liked the post
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // Remove like
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add like and remove dislike if exists
      post.likes.push(userId);
      post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "username email")
      .populate("category", "name");

    res.status(200).json({
      status: "success",
      message: isLiked ? "Post unliked successfully" : "Post liked successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to like post"
    });
  }
});

//@desc  Dislike a post
//@route PUT /api/v1/posts/dislikes/:id
//@access Private
exports.disLikePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userAuth._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found"
      });
    }

    // Check if user already disliked the post
    const isDisliked = post.dislikes.includes(userId);
    
    if (isDisliked) {
      // Remove dislike
      post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add dislike and remove like if exists
      post.dislikes.push(userId);
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "username email")
      .populate("category", "name");

    res.status(200).json({
      status: "success",
      message: isDisliked ? "Post undisliked successfully" : "Post disliked successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Dislike post error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to dislike post"
    });
  }
});

//@desc  Clap a post
//@route PUT /api/v1/posts/claps/:id
//@access Private
exports.claps = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found"
      });
    }

    // Increment claps
    post.claps += 1;
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "username email")
      .populate("category", "name");

    res.status(200).json({
      status: "success",
      message: "Post clapped successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Clap post error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to clap post"
    });
  }
});

//@desc  Schedule a post
//@route PUT /api/v1/posts/schedule/:postId
//@access Private
exports.schedule = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const { scheduledPublish } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found"
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.userAuth._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to schedule this post"
      });
    }

    post.shedduledPublished = new Date(scheduledPublish);
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "username email")
      .populate("category", "name");

    res.status(200).json({
      status: "success",
      message: "Post scheduled successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Schedule post error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to schedule post"
    });
  }
});

//@desc  Track post view count
//@route PUT /api/v1/posts/:id/post-view-count
//@access Private
exports.postViewCount = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userAuth._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: "error",
        message: "Post not found"
      });
    }

    // Check if user hasn't viewed this post before
    if (!post.postViews.includes(userId)) {
      post.postViews.push(userId);
      await post.save();
    }

    const updatedPost = await Post.findById(postId)
      .populate("author", "username email")
      .populate("category", "name");

    res.status(200).json({
      status: "success",
      message: "Post view recorded successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Post view count error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to record post view"
    });
  }
});