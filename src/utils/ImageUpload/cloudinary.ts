import cloudinary from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

export default async function uploadOnCloudinary(localPath: string) {
  try {
    if (!localPath || !fs.existsSync(localPath)) {
      console.log("File does not exist:", localPath);
      return null;
    }
    const result = await cloudinary.v2.uploader.upload(localPath, {
      resource_type: "auto",
    });
    return result;
  } catch (error) {
    log(error);
    fs.unlinkSync(localPath);
    return null;
  }
}
