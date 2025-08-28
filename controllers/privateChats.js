const express = require('express');
const router = express.Router();
const PrivateChat = require('../models/privateChats');
const verifyToken = require('../middleware/verify-token');

// GET all chats for the authenticated user
router.get('/', verifyToken, async (req, res) => {
    try {
        const chats = await PrivateChat.find({
            participants: req.user._id
        })
        .populate('participants', 'username avatar')
        .sort({ lastMessageAt: -1 });

        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET or CREATE a chat between two users
router.post('/start', verifyToken, async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({ err: 'Participant ID is required' });
        }

        if (participantId === req.user._id) {
            return res.status(400).json({ err: 'Cannot start a chat with yourself' });
        }

        // Check if chat already exists
        let existingChat = await PrivateChat.findOne({
            participants: { $all: [req.user._id, participantId] }
        }).populate('participants', 'username avatar');

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        // Create new chat
        const newChat = await PrivateChat.create({
            participants: [req.user._id, participantId],
            messages: []
        });

        const populatedChat = await PrivateChat.findById(newChat._id)
            .populate('participants', 'username avatar');

        res.status(201).json(populatedChat);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET messages from a specific chat
router.get('/:chatId/messages', verifyToken, async (req, res) => {
    try {
        const chat = await PrivateChat.findById(req.params.chatId)
            .populate('participants', 'username avatar')
            .populate('messages.sender', 'username avatar');

        if (!chat) {
            return res.status(404).json({ err: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            participant => participant._id.toString() === req.user._id
        );

        if (!isParticipant) {
            return res.status(403).json({ err: 'Unauthorized to view this chat' });
        }

        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// POST a new message to a chat
router.post('/:chatId/messages', verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        const { chatId } = req.params;

        if (!content || !content.trim()) {
            return res.status(400).json({ err: 'Message content is required' });
        }

        const chat = await PrivateChat.findById(chatId);

        if (!chat) {
            return res.status(404).json({ err: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            participant => participant.toString() === req.user._id
        );

        if (!isParticipant) {
            return res.status(403).json({ err: 'Unauthorized to send messages to this chat' });
        }

        // Add new message
        const newMessage = {
            sender: req.user._id,
            content: content.trim(),
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = content.trim();
        chat.lastMessageAt = new Date();

        await chat.save();

        // Return the updated chat with populated data
        const updatedChat = await PrivateChat.findById(chatId)
            .populate('participants', 'username avatar')
            .populate('messages.sender', 'username avatar');

        res.status(201).json(updatedChat);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// GET a specific chat by ID
router.get('/:chatId', verifyToken, async (req, res) => {
    try {
        const chat = await PrivateChat.findById(req.params.chatId)
            .populate('participants', 'username avatar')
            .populate('messages.sender', 'username avatar');

        if (!chat) {
            return res.status(404).json({ err: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            participant => participant._id.toString() === req.user._id
        );

        if (!isParticipant) {
            return res.status(403).json({ err: 'Unauthorized to view this chat' });
        }

        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// DELETE a chat (only if user is participant)
router.delete('/:chatId', verifyToken, async (req, res) => {
    try {
        const chat = await PrivateChat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({ err: 'Chat not found' });
        }

        // Check if user is a participant
        const isParticipant = chat.participants.some(
            participant => participant.toString() === req.user._id
        );

        if (!isParticipant) {
            return res.status(403).json({ err: 'Unauthorized to delete this chat' });
        }

        await PrivateChat.findByIdAndDelete(req.params.chatId);
        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

module.exports = router;
