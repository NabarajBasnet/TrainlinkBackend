import fs from "fs";
import { log } from "console";
import ConnectDatabase from "../../config/db";
import uploadOnCloudinary from "../../utils/ImageUpload/cloudinary";

export async function uploadFile(req: any, res: any) {
  try {
    await ConnectDatabase();
    // check if file exists (multer added)
    const localPath = req.file?.path;
    if (!localPath) {
      return res.status(400).json({ message: "No file received" });
    }

    // Upload to cloudinary
    const cloudinaryResult = await uploadOnCloudinary(localPath);

    if (!cloudinaryResult) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    // Respond with uploaded URL
    res.status(200).json({
      message: "Image uploaded successfully",
      url: cloudinaryResult.secure_url,
    });

    // ✅ Clean up temp file
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  } catch (error: any) {
    log(error);
    res.status(500).json({
      message: error.message,
    });
  }
}
