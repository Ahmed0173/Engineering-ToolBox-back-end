const express = require('express');
const verifyToken = require('../middleware/verify-token')
const Post = require('../models/post');
const router = express.Router();


// GET all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({}).populate('author', 'username').sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET a specific post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if (!post) {
            return res.status(404).json({ err: 'Post not found' });
        }
        res.status(200).json(post);
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
        ).populate('author', 'username');
        
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

module.exports = router