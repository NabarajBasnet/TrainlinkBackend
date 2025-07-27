import express from "express";
import { authenticateToken } from "../../middleware/auth";
import upload from "../../middleware/multer";
import {
  applyForVerification,
  getVerificationApplications,
  updateVerificationStatus,
} from "../../controllers/verificationController/verificationController";

const router = express.Router();

// Apply for verification
router.post(
  "/apply-verification",
  authenticateToken,
  upload.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
  ]),
  applyForVerification
);

// Admin routes
router.get(
  "/admin/verification-applications",
  authenticateToken,
  getVerificationApplications
);
router.patch(
  "/admin/update-verification-status/:applicationId",
  authenticateToken,
  updateVerificationStatus
);

export default router;
