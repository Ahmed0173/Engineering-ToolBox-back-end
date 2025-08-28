const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    // who wrote it
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    // which post it belongs to
    post_id: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },

    // optional: for replies (null for top-level comments)
    parent_id: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // quick counters & moderation
    replies_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    is_edited: {
      type: Boolean,
      default: false,
    },
    edited_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
