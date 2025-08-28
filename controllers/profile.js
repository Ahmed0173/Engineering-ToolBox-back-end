const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verify-token");
const User = require("../models/user");

const cloudinary = require('cloudinary').v2;

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-hashedPassword");

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.patch("/me", verifyToken, async (req, res) => {
  try {
    const { bio, location, contactInfo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { bio },
      { new: true }
    ).select("-hashedPassword");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "username avatar bio createdAt"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

router.patch('/me/avatar', verifyToken, async (req, res) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'secondhand-avatars',
      width: 200,
      height: 200,
      crop: 'fill'
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-hashedPassword');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Avatar upload failed:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

module.exports = router;