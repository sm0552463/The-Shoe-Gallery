import dotenv from "dotenv";
import cloudinary from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload file
const uploadFile = async (filePath, folder = "default") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder, // Folder where the file will be stored
    });
    return result.url; // Return the Cloudinary URL
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
};

export default uploadFile;
