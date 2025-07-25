import multer from "multer";
import fs from "fs";
import path from "path";

// Save to root/public/temp (not inside src/)
const tempDir = path.join(__dirname, "..", "..", "public", "temp");

// Create folder if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });
export default upload;
