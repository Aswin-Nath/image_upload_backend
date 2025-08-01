const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const app = express();
const port = 4000;
// 
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const username = "Aswin-Nath";
const repoName = "Image_Dumo";
const branch = "main";
const parts = [
  "11A3R", "L6EI0", "b3kpa", "WThwz", "q3_lro",
  "743zy", "AeEA4", "kLSoY", "reFjm", "fpD1v",
  "a3t6w", "xLNj8", "hrTI9", "2QLJI", "IQCLm", "iWTk4", "9"
];

const token = "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";

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

app.post("/upload-image", upload.single("image"), async (req, res) => {
  const { image_name, image_type } = req.body;
  console.log("FILE",req.file);
  console.log("BODY",req.body);
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

app.get("/",(req,res)=>{
  res.send("This is Backend");
})

app.post("/upload-video", upload.single("video"), async (req, res) => {
  const { video_name, video_type } = req.body;

  if (!req.file || !video_name) {
    return res.status(400).json({ error: "Missing required parameters: video_name and video file" });
  }

  try {
    const uploadedUrl = await uploadImageToGitHub(req.file.buffer, video_name, video_type || "mp4");
    res.json({ message: "Video uploaded successfully", url: uploadedUrl });
  } catch (err) {
    console.error("Failed to upload video:", err.message);
    res.status(500).json({ error: "Failed to upload video", details: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

