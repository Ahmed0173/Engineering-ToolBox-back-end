const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        }
      },
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    avatar: {
      type: String, default: ""
     },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },

    // NEW: posts this user saved
    savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post', index: true }]
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.hashedPassword;   // hide password hash
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
