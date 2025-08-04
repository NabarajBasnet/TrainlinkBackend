import fs from "fs";
import { log } from "console";
import ConnectDatabase from "../../config/db";
import uploadOnCloudinary from "../../utils/ImageUpload/cloudinary";
import jwt from "jsonwebtoken";
import User from "../../models/Users/Users";

export async function uploadFile(req: any, res: any) {
  try {
    await ConnectDatabase();
    const loggedInUser = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const { id } = loggedInUser;
    const user = await User.findById(id);

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

    const { secure_url } = cloudinaryResult;
    user.avatarUrl = secure_url;
    await user.save();
    
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
