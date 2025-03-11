const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const User = require('../models/user');
const { isLoggedIn } = require('../middleware');
const router = express.Router();

// 50 requests per minute per IP
const songLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50, 
  message: { error: "Too many requests, please try again later." }
});

// Fetch Songs
const fetchSongsFromAPI = async (query, page, limit) => {
  try {
    const { data } = await axios.get(`${process.env.API}/search/songs`, {
      params: { query, page, limit }
    });

    const songs = data?.data?.results?.filter(item => item.type === "song") || [];
    return songs.map(song => ({
      id: song.id,
      title: song.name,
      album: song.album?.name || "Unknown Album",
      albumUrl: song.album?.url || "",
      duration: song.duration,
      coverImage: song.image?.[2]?.url || "//assets/default.png",
      songLink: song.url,
      artists: song.primaryArtists || [],
      audioLinks: song.downloadUrl?.[4] 
    }));
  } catch (error) {
    console.error("Error fetching songs:", error.message);
    return null;
  }
};

// Fetch Song Details
router.get('/song-details', songLimiter, async (req, res) => {
  const { song, artist, page = 1, limit = 30 } = req.query;
  if (!song && !artist) return res.status(400).json({ error: "Missing song or artist name" });

  const songQuery = song || artist;
  const songData = await fetchSongsFromAPI(songQuery, page, limit);

  if (!songData || songData.length === 0) {
    return res.status(404).json({ error: "No songs found" });
  }

  res.json(songData);
});

// Add to Favorites
router.post("/add-to-favorites", isLoggedIn, async (req, res) => {
  const { song } = req.body;
  const userId = req.user?._id;

  if (!song?.id || !song?.thumbnail || !song?.audioUrl || !song?.name) {
    return res.status(400).json({ error: "Invalid song details" });
  }

  try {
    const exists = await User.exists({ _id: userId, "favoriteSongs.id": song.id });
    if (exists) return res.json({ message: "Song is already in favorites!" });

    const songData = {
      id: song.id,
      name: song.name,
      album: song.album || "Unknown Album",
      audioUrl: song.audioUrl || song.audioLinks?.[0]?.link || "",
      thumbnail: song.thumbnail
    };

    await User.findByIdAndUpdate(userId, { $push: { favoriteSongs: songData } });
    res.json({ message: "Song added to favorites!" });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ error: "Failed to add song to favorites." });
  }
});

// Remove from Favorites
router.post("/remove-from-favorites", isLoggedIn, async (req, res) => {
  const { songId } = req.body;
  const userId = req.user?._id;

  if (!songId) return res.status(400).json({ error: "Invalid song ID" });
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    console.log("Removing song with ID:", songId); // Debugging

    const result = await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteSongs: { id: songId } } },
      { new: true } // Return updated document
    );

    if (!result) return res.status(404).json({ error: "User not found or song not in favorites" });

    console.log("Updated favorites:", result.favoriteSongs);
    res.json({ message: "Song removed from favorites!", updatedFavorites: result.favoriteSongs });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ error: "Failed to remove song from favorites." });
  }
});


// Check if Song is in Favorites
router.get("/is-favorite", isLoggedIn, async (req, res) => {
  const { songId } = req.query;
  const userId = req.user?._id;

  if (!songId) return res.status(400).json({ error: "Invalid song ID" });

  try {
    const isFavorite = await User.exists({ _id: userId, "favoriteSongs.id": songId });
    res.json({ isFavorite: !!isFavorite });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({ error: "Failed to check favorite status." });
  }
});

module.exports = router;
