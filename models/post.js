const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({

    post_id:{
        type: Number,
        required: true,
        unique: true
    },
    user_id:{
        type: Number,
        required: true,
        unique: true
    },
    content:{
        type: String,
        required: true,
    },
    likes:{
        type: Number
    }
},
  {
    timestamps: true,
  }
);
const Post = mongoose.model('Post', postSchema)

module.exports = Post;