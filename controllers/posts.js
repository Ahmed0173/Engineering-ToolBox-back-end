const express = require('express');
const verifyToken = require('../middleware/verify-token')
const Post = require('../models/post');
const router = express.Router();


// GET all posts
router.get('/', async (req, res) => {
    try {
        const { author, likedBy, savedBy, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        // Filter by author if provided
        if (author) {
            query.author = author;
        }
        
        // Filter by liked posts if provided
        if (likedBy) {
            query.likes = { $in: [likedBy] };
        }
        
        // Filter by saved posts if provided
        if (savedBy) {
            // This requires a different approach since savedPosts is on User model
            const User = require('../models/user');
            const user = await User.findById(savedBy);
            if (user && user.savedPosts) {
                query._id = { $in: user.savedPosts };
            } else {
                // If user not found or has no saved posts, return empty array
                return res.status(200).json([]);
            }
        }
        
        const posts = await Post.find(query)
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Add savedBy information to each post
        if (posts.length > 0) {
            const User = require('../models/user');
            // Get all users who have saved any of these posts
            const postIds = posts.map(post => post._id);
            const usersWithSavedPosts = await User.find({
                savedPosts: { $in: postIds }
            }).select('_id savedPosts');

            // Create a map of postId -> array of userIds who saved it
            const savedByMap = {};
            usersWithSavedPosts.forEach(user => {
                user.savedPosts.forEach(savedPostId => {
                    if (postIds.some(id => id.toString() === savedPostId.toString())) {
                        if (!savedByMap[savedPostId.toString()]) {
                            savedByMap[savedPostId.toString()] = [];
                        }
                        savedByMap[savedPostId.toString()].push(user._id);
                    }
                });
            });

            // Add savedBy field to each post
            const postsWithSavedBy = posts.map(post => {
                const postObj = post.toObject();
                postObj.savedBy = savedByMap[post._id.toString()] || [];
                return postObj;
            });

            res.status(200).json(postsWithSavedBy);
        } else {
            res.status(200).json(posts);
        }
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET a specific post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username avatar');
        if (!post) {
            return res.status(404).json({ err: 'Post not found' });
        }

        // Add savedBy information
        const User = require('../models/user');
        const usersWhoSavedPost = await User.find({
            savedPosts: req.params.id
        }).select('_id');

        const postObj = post.toObject();
        postObj.savedBy = usersWhoSavedPost.map(user => user._id);

        res.status(200).json(postObj);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// CREATE a new post
router.post('/new', verifyToken, async (req, res) => {
    try {
        req.body.author = req.user._id
        const newPost = await Post.create(req.body)
        newPost._doc.author = req.user
        res.status(201).json(newPost)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }
});

// UPDATE a post
router.put('/:id/update', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ err: 'Post not found' });
        }
        
        // Check if the user is the author of the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ err: 'You can only update your own posts' });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('author', 'username avatar');
        
        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});


// DELETE a post
router.delete('/:id/delete', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ err: 'Post not found' });
        }
        
        // Check if the user is the author of the post
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ err: 'You can only delete your own posts' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// LIKE/UNLIKE a post
router.post('/:id/like', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ err: 'Post not found' });
        }

        const userId = req.user._id;
        const userIndex = post.likes.indexOf(userId);

        if (userIndex === -1) {
            // User hasn't liked the post yet, so add like
            post.likes.push(userId);
        } else {
            // User has already liked the post, so remove like
            post.likes.splice(userIndex, 1);
        }

        await post.save();
        const updatedPost = await Post.findById(req.params.id).populate('author', 'username avatar');
        
        // Add savedBy information
        const User = require('../models/user');
        const usersWhoSavedPost = await User.find({
            savedPosts: req.params.id
        }).select('_id');

        const postObj = updatedPost.toObject();
        postObj.savedBy = usersWhoSavedPost.map(user => user._id);
        
        res.status(200).json(postObj);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// SAVE/UNSAVE a post
router.post('/:id/save', verifyToken, async (req, res) => {
    try {
        const User = require('../models/user');
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ err: 'Post not found' });
        }

        const user = await User.findById(req.user._id);
        const postIndex = user.savedPosts.indexOf(req.params.id);

        if (postIndex === -1) {
            // Post not saved yet, so add it
            user.savedPosts.push(req.params.id);
        } else {
            // Post already saved, so remove it
            user.savedPosts.splice(postIndex, 1);
        }

        await user.save();
        res.status(200).json({ message: postIndex === -1 ? 'Post saved successfully' : 'Post unsaved successfully' });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET user's liked posts
router.get('/users/liked-posts', verifyToken, async (req, res) => {
    try {
        const likedPosts = await Post.find({ 
            likes: { $in: [req.user._id] } 
        }).populate('author', 'username avatar').sort({ createdAt: -1 });
        
        res.status(200).json(likedPosts);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET user's saved posts
router.get('/users/saved-posts', verifyToken, async (req, res) => {
    try {
        const User = require('../models/user');
        const user = await User.findById(req.user._id).populate({
            path: 'savedPosts',
            populate: {
                path: 'author',
                select: 'username'
            },
            options: { sort: { createdAt: -1 } }
        });
        
        res.status(200).json(user.savedPosts);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = router