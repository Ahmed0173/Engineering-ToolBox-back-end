const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verify-token");
const User = require("../models/user");

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
    const { bio, contactInfo, username, title, avatar } = req.body;

    // Validate input
    if (bio && bio.length > 500) {
      return res.status(400).json({ error: "Bio must be 500 characters or less" });
    }
    
    if (username && username.trim().length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }

    // Build update object
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (username !== undefined) updateData.username = username.trim();
    if (title !== undefined) updateData.title = title;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-hashedPassword");

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "username avatar bio title createdAt"
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

module.exports = router;