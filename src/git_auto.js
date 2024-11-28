const express = require("express");
const cors = require("cors"); // Import cors
const multer = require("multer"); // Import multer for file uploads
const fs = require("fs");
const axios = require("axios");
// require("dotenv").config(); // For environment variables

const app = express();
const port = 4000; // Port for your API server

// Enable CORS
app.use(cors({origin:'https://image-upload-80na.onrender.com/'})); // Allow all origins by default

// Middleware to parse JSON requests
app.use(express.json());

// Multer configuration to handle image upload
const storage = multer.memoryStorage(); // Store file in memory for easy access
const upload = multer({ storage: storage });

// GitHub Configuration
const username = "Aswin-Nath";
const repoName = "Image_Dumo";
const branch = "main";
const token ="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"; // Store token securely in .env file
const githubApiUrl = "https://api.github.com";

async function uploadImageToGitHub(imageBuffer, imageName, imageType = "jpg") {
  const filePathInRepo = `${imageName}.${imageType}`;
  const targetUrl = `${githubApiUrl}/repos/${username}/${repoName}/contents/${filePathInRepo}`;

  try {
    const fileContent = imageBuffer.toString("base64");

    const response = await axios.put(
      targetUrl,
      {
        message: `Add image ${filePathInRepo}`,
        content: fileContent,
        branch: branch,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const uploadedFileUrl = response.data.content.download_url;
    console.log(`File uploaded successfully: ${uploadedFileUrl}`);
    return uploadedFileUrl;
  } catch (error) {
    console.error("Error uploading the file:", error.response?.data || error.message);
    throw error;
  }
}

// API Endpoint to upload the image
app.post("/upload-image", upload.single("image"), async (req, res) => {
  const { image_name, image_type } = req.body;

  if (!req.file || !image_name) {
    return res.status(400).json({ error: "Missing required parameters: image_name and image" });
  }

  try {
    const uploadedUrl = await uploadImageToGitHub(req.file.buffer, image_name, image_type || "jpg");
    res.json({ message: "Image uploaded successfully", url: uploadedUrl });
  } catch (err) {
    console.error("Failed to upload image:", err.message);
    res.status(500).json({ error: "Failed to upload image", details: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
