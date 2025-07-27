import express from "express";
import { authenticateToken, optionalAuth } from "../../middleware/auth";
import {
  createProgram,
  getAllPrograms,
  getMyPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
  toggleFavorite,
  getFavoritePrograms,
} from "../../controllers/programControllers/programControllers";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create-program", authenticateToken, createProgram);
router.get("/get-my-programs", authenticateToken, getMyPrograms);
router.get("/get-program/:id", authenticateToken, getProgramById);
router.put("/update-program/:id", authenticateToken, updateProgram);
router.delete("/delete-program/:id", authenticateToken, deleteProgram);
router.post("/toggle-favorite/:programId", authenticateToken, toggleFavorite);
router.get("/get-favorite-programs", authenticateToken, getFavoritePrograms);

// Public routes (optional authentication)
router.get("/get-all-programs", optionalAuth, getAllPrograms);

export default router;
