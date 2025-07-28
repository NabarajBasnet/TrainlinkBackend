import { Request, Response } from "express";
import { Proposal } from "../../models/Proposal/Proposal";
import { Enrollment } from "../../models/Enrollment/Enrollment";
import User from "../../models/Users/Users";
import jwt from "jsonwebtoken";
import ConnectDatabase from "../../config/db";
import mongoose from "mongoose";

export class ProposalController {
  // Create a new proposal

  async createProposal(req: Request, res: Response) {
    try {
      await ConnectDatabase();
      const JWT_SECRET = process.env.JWT_SECRET!;
      const token = req.cookies.token;
      const loggedInUser = jwt.verify(token, JWT_SECRET) as { id: string };
      const { id } = loggedInUser;

      let { memberId, planId, message } = req.body;

      // Convert to ObjectId
      const trainerId = new mongoose.Types.ObjectId(id);
      memberId = new mongoose.Types.ObjectId(memberId);
      planId = new mongoose.Types.ObjectId(planId);

      // Check if already proposed
      const existingProposal = await Proposal.findOne({
        trainerId,
        memberId,
        planId,
      });

      if (existingProposal) {
        return res.status(401).json({
          message: "You've already sent a proposal for this training request.",
        });
      }

      const newProposal = new Proposal({
        trainerId,
        memberId,
        planId,
        message,
      });

      await newProposal.save();

      res.status(201).json({
        success: true,
        message: "Proposal sent successfully",
      });
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get proposals for a user (as trainer or member)
  async getProposals(req: Request, res: Response) {
    try {
      await ConnectDatabase();
      const jwt_secret = process.env.JWT_SECRET;
      const token = req.cookies.token;
      const loggedInUser = jwt.verify(token, jwt_secret);
      const { id } = loggedInUser;
      const user = await User.findById(id);
      const userRole = user.role;

      const pendingProposals = await Proposal.find({
        status: "Pending",
        trainerId: id,
      })
        .populate("trainerId")
        .populate("memberId")
        .populate("planId");

      const resolvedProposals = await Proposal.find({
        treinerId: id,
        status: { $in: ["Accepted", "Rejected"] },
      })
        .populate("trainerId")
        .populate("memberId")
        .populate("planId");

      res.status(200).json({
        message: "Proposals are fetched",
        pendingProposals,
        resolvedProposals,
      });
    } catch (error) {
      console.log("Error: ", error);
      res.status(500).json({
        message: error.message,
      });
    }
  }

  // Respond to proposal (accept/reject)
  async respondToProposal(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;
      const { action } = req.body; // 'accept' or 'reject'
      const memberId = (req as any).user.id;

      const proposal = await Proposal.findById(proposalId);

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Proposal not found",
        });
      }

      if (proposal.memberId.toString() !== memberId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (proposal.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Proposal has already been responded to",
        });
      }

      const newStatus = action === "accept" ? "accepted" : "rejected";
      proposal.status = newStatus;
      await proposal.save();

      // If accepted, create enrollment
      if (action === "accept") {
        const enrollment = new Enrollment({
          trainerId: proposal.trainerId,
          memberId: proposal.memberId,
          planId: proposal.planId,
          proposalId: proposal._id,
        });
        await enrollment.save();
      }

      // Emit real-time update to trainer
      const io = (req as any).app.get("io");
      if (io) {
        io.to(proposal.trainerId.toString()).emit("proposalResponse", {
          proposalId: proposal._id,
          status: newStatus,
          action,
        });
      }

      res.status(200).json({
        success: true,
        message: `Proposal ${action}ed successfully`,
        data: proposal,
      });
    } catch (error) {
      console.error("Error responding to proposal:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete proposal (only by sender)
  async deleteProposal(req: Request, res: Response) {
    try {
      const { proposalId } = req.params;
      const trainerId = (req as any).user.id;

      const proposal = await Proposal.findById(proposalId);

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Proposal not found",
        });
      }

      if (proposal.trainerId.toString() !== trainerId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (proposal.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Cannot delete responded proposal",
        });
      }

      await Proposal.findByIdAndDelete(proposalId);

      res.status(200).json({
        success: true,
        message: "Proposal deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting proposal:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
