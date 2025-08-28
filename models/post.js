const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({

    post_id:{
        type: Number,
        required: false,
        unique: true
    },
    user_id:{
        type: Number,
        required: false,
        unique: true
    },
    content:{
        type: String,
        required: true,
    },
    likes:{
        type: Number
    }
    ,
    tags: [{
        type: String,
        required: false,
    }]
},
  {
    timestamps: true,
  }
);
const Post = mongoose.model('Post', postSchema)

module.exports = Post;