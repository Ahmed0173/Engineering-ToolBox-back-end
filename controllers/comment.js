const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');
const mongoose = require('mongoose');
const Post = require('../models/post');
const Comment = require('../models/comments');

// Add a comment to a post
router.post('/:postId/new', verifyToken, async (req, res) => {
	try {
		const { content } = req.body;
		
		if (!content || content.trim().length === 0) {
			return res.status(400).json({ message: 'Comment content is required' });
		}

		const post = await Post.findById(req.params.postId);
		if (!post) return res.status(404).json({ message: 'Post not found' });

		const newComment = new Comment({
			content: content.trim(),
			user_id: req.user.id,
			post_id: req.params.postId
		});
		
		await newComment.save();
		
		res.status(201).json({ message: 'Comment added successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (!post) return res.status(404).json({ message: 'Post not found' });
		
		const comments = await Comment.find({ post_id: req.params.postId })
			.populate('user_id', 'username avatar')
			.populate('parent_id', 'content user_id')
			.sort({ createdAt: -1 });
		
		res.json(comments);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Delete a comment from a post
router.delete('/:postId/:commentId', verifyToken, async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.commentId);
		if (!comment) return res.status(404).json({ message: 'Comment not found' });

		// Check if comment belongs to the post
		if (comment.post_id.toString() !== req.params.postId) {
			return res.status(400).json({ message: 'Comment does not belong to this post' });
		}

		// Check if user owns the comment
		if (comment.user_id.toString() !== req.user.id) {
			return res.status(403).json({ message: 'Not authorized to delete this comment' });
		}

		await Comment.findByIdAndDelete(req.params.commentId);
		
		res.json({ message: 'Comment deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Update a comment - need a fix
// router.put('/:postId/:commentId/update', verifyToken, async (req, res) => {
// 	try {
// 		const { content } = req.body;
		
// 		if (!content || content.trim().length === 0) {
// 			return res.status(400).json({ message: 'Comment content is required' });
// 		}

// 		const comment = await Comment.findById(req.params.commentId);
// 		if (!comment) return res.status(404).json({ message: 'Comment not found' });

// 		// Check if user owns the comment
// 		if (comment.user_id.toString() !== req.user.id) {
// 			return res.status(403).json({ message: 'Not authorized to update this comment' });
// 		}

// 		comment.content = content.trim();
// 		await comment.save();
		
// 		res.json({ message: 'Comment updated successfully' });
// 	} catch (err) {
// 		res.status(500).json({ message: err.message });
// 	}
// });

// Reply to a comment
router.post('/:postId/:commentId/reply', verifyToken, async (req, res) => {
	try {
		const { content } = req.body;
		
		if (!content || content.trim().length === 0) {
			return res.status(400).json({ message: 'Reply content is required' });
		}

		// Check if parent comment exists
		const parentComment = await Comment.findById(req.params.commentId);
		if (!parentComment) return res.status(404).json({ message: 'Comment not found' });

		// Check if comment belongs to the post
		if (parentComment.post_id.toString() !== req.params.postId) {
			return res.status(400).json({ message: 'Comment does not belong to this post' });
		}

		const newReply = new Comment({
			content: content.trim(),
			user_id: req.user.id,
			post_id: req.params.postId,
			parent_id: req.params.commentId
		});
		
		await newReply.save();

		// Update parent comment replies count
		parentComment.replies_count += 1;
		await parentComment.save();
		
		res.status(201).json({ message: 'Reply added successfully' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

module.exports = router;

