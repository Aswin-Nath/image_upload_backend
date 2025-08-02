const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001;

// Load values from .env
const username = process.env.GITHUB_USERNAME;
const repoName = process.env.GITHUB_REPO;
const branch = process.env.GITHUB_BRANCH;
const token = process.env.GITHUB_TOKEN;

app.use(cors());
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);
    const base64Content = fileContent.toString("base64");

    const filename = req.file.originalname.replace(/\s+/g, "_");
    const githubPath = `uploads/${Date.now()}_${filename}`;
    const apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents/${githubPath}`;

    const response = await axios.put(
      apiUrl,
      {
        message: `Upload image ${filename}`,
        content: base64Content,
        branch: branch,
      },
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Node.js",
        },
      }
    );

    fs.unlinkSync(filePath); // Clean up local upload

    const fileUrl = response.data.content.download_url;
    res.json({ message: "Image uploaded successfully", url: fileUrl });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
