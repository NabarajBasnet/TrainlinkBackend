import express from "express";
import { authenticateToken, optionalAuth } from "../../middleware/auth";
import {
  createNewTrainingRequest,
  getMyTrainingRequests,
  getTrainingRequestById,
  getTrainingRequestByIdPublic,
  updateTrainingRequest,
  deleteTrainingRequest,
  deleteMultipleTrainingRequests,
  getAllTrainingRequests,
} from "../../controllers/trainingRequestControllers/TrainingRequestControllers";

const router = express.Router();

// Protected routes (require authentication)
router.post(
  "/create-training-request",
  authenticateToken,
  createNewTrainingRequest
);
router.get(
  "/get-my-training-requests",
  authenticateToken,
  getMyTrainingRequests
);
router.get(
  "/get-training-request/:id",
  authenticateToken,
  getTrainingRequestById
);
router.put(
  "/update-training-request/:id",
  authenticateToken,
  updateTrainingRequest
);
router.delete(
  "/delete-training-request/:id",
  authenticateToken,
  deleteTrainingRequest
);
router.delete(
  "/delete-training-requests",
  authenticateToken,
  deleteMultipleTrainingRequests
);

// Public routes (optional authentication)
router.get("/get-all-training-requests", optionalAuth, getAllTrainingRequests);
router.get(
  "/get-training-request-public/:id",
  optionalAuth,
  getTrainingRequestByIdPublic
);

export default router;
