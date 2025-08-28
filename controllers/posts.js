const express = require('express');
const verifyToken = require('../middleware/verify-token')
const Post = require('../models/post');
const router = express.Router();


router.post('/new', verifyToken, async (req, res) => {
    try {
        req.body.author = req.user._id
        const newPost = await Post.create(req.body)
        newPost._doc.author = req.user
        res.status(201).json(newPost)
    } catch (err) {
        res.status(500).json({ err: err.message })
    }

})


module.exports = router