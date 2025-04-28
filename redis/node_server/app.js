const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");

const app = express();
const redis = new Redis({ host: "redis", port: 6379 });
const PORT = 3000;

// Example API to cache (we'll use JSONPlaceholder)
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// Cache middleware
async function cacheMiddleware(req, res, next) {
  const { id } = req.params;
  const hashKey = "posts"; // Using a single hash for all posts

  try {
    // Check Redis hash for cached data
    const cachedData = await redis.hget(hashKey, id);
    if (cachedData) {
      console.log("Serving from cache 🚀");
      return res.json(JSON.parse(cachedData));
    }
    next();
  } catch (err) {
    console.error("Cache error:", err);
    next();
  }
}

// Route: Get a post by ID (with caching)
app.get("/posts/:id", cacheMiddleware, async (req, res) => {
  const { id } = req.params;
  const hashKey = "posts";

  try {
    const response = await axios.get(`${API_URL}/${id}`);
    const data = response.data;

    // Save to Redis hash
    await redis.hset(hashKey, id, JSON.stringify(data));
    console.log("Serving from API ⚡");

    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Error fetching post",
      message: err.message
    });
  }
});

// New route to get all cached posts
app.get("/posts", async (req, res) => {
  try {
    const hashKey = "posts";
    const allPosts = await redis.hgetall(hashKey);
    
    // Parse all posts from hash
    const parsedPosts = Object.entries(allPosts).map(([id, post]) => ({
      id,
      ...JSON.parse(post)
    }));

    return res.json(parsedPosts);
  } catch (err) {
    return res.status(500).json({
      error: "Error fetching posts",
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});