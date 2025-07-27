import express from "express";
import { authenticateToken } from "../../middleware/auth";

const router = express.Router();

// Simple test route
router.get("/test", (req, res) => {
  res.json({ message: "Enrollment routes working" });
});

// Get enrollments
router.get("/", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update progress (trainers only)
router.patch("/:enrollmentId/progress", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Progress update route working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Cancel enrollment
router.patch("/:enrollmentId/cancel", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Cancel route working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
