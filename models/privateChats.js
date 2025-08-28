const mongoose = require('mongoose');
const { Schema } = mongoose;

const privateChatSchema = new mongoose.Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
    }],
    lastMessage: {
        type: String,
        trim: true
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PrivateChat', privateChatSchema);
