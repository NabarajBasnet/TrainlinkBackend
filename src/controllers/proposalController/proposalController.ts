import { Request, Response } from "express";
import { Proposal } from "../../models/Proposal/Proposal";
import { Enrollment } from "../../models/Enrollment/Enrollment";
import { Program } from "../../models/Programs/Programs";
import User from "../../models/Users/Users";

export class ProposalController {
  // Create a new proposal
  static async createProposal(req: Request, res: Response) {
    try {
      const { planId, memberId, message } = req.body;
      const trainerId = (req as any).user.id;

      // Check if proposal already exists
      const existingProposal = await Proposal.findOne({
        trainerId,
        memberId,
        planId,
        status: "pending",
      });

      if (existingProposal) {
        return res.status(400).json({
          success: false,
          message: "You have already sent a proposal for this plan",
        });
      }

      // Verify the plan exists and belongs to the member
      const plan = await Program.findById(planId);
      if (!plan || plan.userId.toString() !== memberId) {
        return res.status(404).json({
          success: false,
          message: "Plan not found",
        });
      }

      const proposal = new Proposal({
        trainerId,
        memberId,
        planId,
        message,
      });

      await proposal.save();

      // Populate trainer info for notification
      const trainer = await User.findById(trainerId).select(
        "firstName lastName profilePicture"
      );

      // Emit real-time notification to member
      const io = (req as any).app.get("io");
      if (io) {
        io.to(memberId).emit("newProposal", {
          proposal: {
            ...proposal.toObject(),
            trainer: trainer,
          },
        });
      }

      res.status(201).json({
        success: true,
        message: "Proposal sent successfully",
        data: proposal,
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
  static async getProposals(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { role, status } = req.query;

      let query: any = {};

      if (role === "trainer") {
        query.trainerId = userId;
      } else if (role === "member") {
        query.memberId = userId;
      } else {
        // Get all proposals where user is involved
        query.$or = [{ trainerId: userId }, { memberId: userId }];
      }

      if (status) {
        query.status = status;
      }

      const proposals = await Proposal.find(query)
        .populate("trainerId", "firstName lastName profilePicture")
        .populate("memberId", "firstName lastName profilePicture")
        .populate("planId", "title description")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: proposals,
      });
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Respond to proposal (accept/reject)
  static async respondToProposal(req: Request, res: Response) {
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
  static async deleteProposal(req: Request, res: Response) {
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
