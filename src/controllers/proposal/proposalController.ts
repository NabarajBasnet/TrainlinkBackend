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

  // Get proposals for a user (trainer only)
  async getProposals(req: Request, res: Response) {
    try {
      await ConnectDatabase();
      const jwt_secret = process.env.JWT_SECRET;
      const token = req.cookies.token;
      const loggedInUser = jwt.verify(token, jwt_secret);
      const { id } = loggedInUser;
      const user = await User.findById(id);

      const pendingProposals = await Proposal.find({
        status: "Pending",
        trainerId: id,
      })
        .sort({ createdAt: -1 })
        .populate("trainerId")
        .populate("memberId")
        .populate("planId");

      const resolvedProposals = await Proposal.find({
        trainerId: id,
        status: { $in: ["Accepted", "Rejected", "Cancelled"] },
      })
        .sort({ createdAt: -1 })
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

  // Get proposals for a user (members only)
  async getProposalsFromMember(req: Request, res: Response) {
    try {
      await ConnectDatabase();
      const jwt_secret = process.env.JWT_SECRET;
      const token = req.cookies.token;
      const loggedInUser = jwt.verify(token, jwt_secret);
      const { id } = loggedInUser;
      const user = await User.findById(id);

      const pendingProposals = await Proposal.find({
        status: "Pending",
        memberId: id,
      })
        .sort({ createdAt: -1 })
        .populate("trainerId")
        .populate("memberId")
        .populate("planId");

      const resolvedProposals = await Proposal.find({
        memberId: id,
        status: { $in: ["Accepted", "Rejected", "Cancelled"] },
      })
        .sort({ createdAt: -1 })
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
      await ConnectDatabase();
      const jwt_secret = process.env.JWT_SECRET;
      const token = req.cookies.token;
      const loggedInUser = jwt.verify(token, jwt_secret);
      const { id: trainerId } = loggedInUser;
      const user = await User.findById(trainerId);
      const userRole = user.role;
      if (userRole === "Trainer") {
        return res.status(401).json({
          message: "Unauthorized action",
        });
      }

      const { id, action, responseTitle, responseMessage } = req.body;
      const proposalObjId = new mongoose.Types.ObjectId(id);
      const proposal = await Proposal.findById(proposalObjId);
      if (!proposal) {
        return res.status(401).json({
          message: "Proposal not found",
        });
      }

      if (proposal.status === "Cancelled") {
        return res.status(401).json({
          message: "Proposal is in cancelled state",
        });
      }

      proposal.status = action;
      proposal.respondTitle = responseTitle;
      proposal.respondMessage = responseMessage;
      await proposal.save();

      res.status(200).json({
        success: true,
        message: `Proposal ${action} successfully`,
      });
    } catch (error) {
      console.error("Error responding to proposal:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Cancell a proposal (cancell) (trainer only)
  async cancellAProposal(req: Request, res: Response) {
    try {
      await ConnectDatabase();

      const jwt_secret = process.env.JWT_SECRET!;
      const token = req.cookies.token;

      const loggedInUser = jwt.verify(token, jwt_secret) as { id: string };
      const { id: trainerId } = loggedInUser;

      const trainer = await User.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }

      const { id, cancellationReason } = req.body;
      const planId = new mongoose.Types.ObjectId(id);

      const proposal = await Proposal.findOne({
        _id: planId,
        status: "Pending",
      });

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Proposal not found or not in a pending state",
        });
      }

      proposal.cancellationReason = cancellationReason;
      proposal.status = "Cancelled";
      await proposal.save();

      res.status(200).json({
        success: true,
        message: "Proposal is cancelled as per you request",
      });
    } catch (error) {
      console.error("Error cancelling proposal:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Resend a proposal (cancell) (trainer only)
  async resendAProposal(req: Request, res: Response) {
    try {
      await ConnectDatabase();

      const jwt_secret = process.env.JWT_SECRET!;
      const token = req.cookies.token;

      const loggedInUser = jwt.verify(token, jwt_secret) as { id: string };
      const { id: trainerId } = loggedInUser;

      const trainer = await User.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }

      const { id } = req.body;
      const planId = new mongoose.Types.ObjectId(id);

      const proposal = await Proposal.findOne({
        _id: planId,
        status: "Cancelled",
      });

      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: "Proposal not found or not in a cancelled state",
        });
      }

      proposal.status = "Pending";
      await proposal.save();

      res.status(200).json({
        success: true,
        message: "Proposal is recreated as per you request",
      });
    } catch (error) {
      console.error("Error resending proposal:", error);
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
