import express from "express";
const router = express.Router();
import upload from "../../middleware/multer";

import { uploadFile } from "../../controllers/FileUploadController/FileuploadController";

router.post("/upload-image", upload.single("image"), uploadFile);

export default router;
