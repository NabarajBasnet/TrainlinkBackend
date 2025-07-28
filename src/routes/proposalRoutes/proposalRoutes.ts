import express from "express";
import { authenticateToken } from "../../middleware/auth";
import { ProposalController } from "../../controllers/proposalController/proposalController";

const proposalController = new ProposalController();

const router = express.Router();

// Get proposals (Trainers only)
router.get(
  "/get-proposals",
  authenticateToken,
  proposalController.getProposals
);

// Create proposal (trainers only)
router.post(
  "/create-proposal",
  authenticateToken,
  proposalController.createProposal
);

// Get proposals
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

// Respond to proposal (members only)
router.patch("/:proposalId/respond", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Response route working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete proposal (sender only)
router.delete("/:proposalId", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Delete route working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
