const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes:{
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        required: false,
    }]
},
  {
    timestamps: true,
  }
);
postSchema.virtual('likes_count').get(function () {
  return this.likes ? this.likes.length : 0;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });


const Post = mongoose.model('Post', postSchema)

module.exports = Post;