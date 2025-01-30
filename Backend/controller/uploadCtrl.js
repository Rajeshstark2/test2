const fs = require("fs/promises");
const asyncHandler = require("express-async-handler");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");

// Upload Images
const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = async (path) => cloudinaryUploadImg(path, "images");

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided" });
    }

    const uploadPromises = req.files.map(async (file) => {
      const { path } = file;
      const uploadedFile = await uploader(path);
      await fs.unlink(path); // Safely delete the file after uploading
      return uploadedFile;
    });

    const images = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images,
    });
  } catch (error) {
    console.error("Error uploading images:", error.message);
    res.status(500).json({ success: false, message: "Failed to upload images" });
  }
});

// Delete Image
const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await cloudinaryDeleteImg(id, "images"); // Ensure this is awaited
    res.status(200).json({
      success: true,
      message: `Image with ID ${id} deleted successfully`,
    });
  } catch (error) {
    console.error(`Failed to delete image with ID ${id}:`, error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
});

module.exports = {
  uploadImages,
  deleteImages,
};

