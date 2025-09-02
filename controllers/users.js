const express = require('express');
const verifyToken = require('../middleware/verify-token')
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comments');

router.get('/currentUser', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ err: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Get user statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Count posts created by user
    const postsCount = await Post.countDocuments({ author: userId });

    // Count comments made by user
    const commentsCount = await Comment.countDocuments({ user_id: userId });

    // Count total likes received on user's posts
    const userPosts = await Post.find({ author: userId });
    const likesReceived = userPosts.reduce((total, post) => total + (post.likes ? post.likes.length : 0), 0);

    res.json({
      postsCount,
      commentsCount,
      likesReceived
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Get public profile for any user
router.get('/profile/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-hashedPassword -email');
    
    if (!user) {
      return res.status(404).json({ err: 'User not found.' });
    }

    // Get user statistics
    const postsCount = await Post.countDocuments({ author: req.params.userId });
    const commentsCount = await Comment.countDocuments({ user_id: req.params.userId });
    const userPosts = await Post.find({ author: req.params.userId });
    const likesReceived = userPosts.reduce((total, post) => total + (post.likes ? post.likes.length : 0), 0);

    // Get recent posts by this user (last 3)
    const recentPosts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('content createdAt likes tags')
      .populate('author', 'username');

    res.json({
      user,
      stats: {
        postsCount,
        commentsCount,
        likesReceived
      },
      recentPosts
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/:userId', verifyToken, async (req, res) => {
  try {
    // If the user is looking for the details of another user, block the request
    // Send a 403 status code to indicate that the user is unauthorized
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ err: 'Unauthorized' });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ err: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
