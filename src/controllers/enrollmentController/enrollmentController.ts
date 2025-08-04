import { Request, Response } from "express";
import { Enrollment } from "../../models/Enrollment/Enrollment";
import { Proposal } from "../../models/Proposal/Proposal";
import ConnectDatabase from "../../config/db";

export class EnrollmentController {
  // Get enrollments for a user
  static async createEnrollments(req: Request, res: Response) {
    try {
      await ConnectDatabase();
      console.log("Body: ", req.body);

      // Destructure the required data
      const { userId: memberId, programDetails } = req.body;

      // Destructure trainerId and programId from programDetails
      const programId = programDetails._id;
      const trainerId = programDetails.trainerId._id;

      // Define the progress object
      const progress = {
        completedSessions: 0,
        totalSessions: 0,
        lastSessionDate: undefined,
      };

      // Create new enrollment
      const newEnrollment = await Enrollment.create({
        trainerId,
        memberId,
        planId: programId,
        proposalId: programId,
        status: "Active",
        startDate: new Date(),
        endDate: new Date(),
        progress,
      });

      res.status(200).json({
        success: true,
        message: "Enrolled successfully, wait for connection",
        data: newEnrollment,
      });
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get enrollments for a user
  static async getEnrollments(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { role, status } = req.query;

      let query: any = {};

      if (role === "trainer") {
        query.trainerId = userId;
      } else if (role === "member") {
        query.memberId = userId;
      } else {
        // Get all enrollments where user is involved
        query.$or = [{ trainerId: userId }, { memberId: userId }];
      }

      if (status) {
        query.status = status;
      }

      const enrollments = await Enrollment.find(query)
        .populate("trainerId", "firstName lastName profilePicture")
        .populate("memberId", "firstName lastName profilePicture")
        .populate("planId", "title description")
        .populate("proposalId", "message")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: enrollments,
      });
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update enrollment progress
  static async updateProgress(req: Request, res: Response) {
    try {
      const { enrollmentId } = req.params;
      const { completedSessions, totalSessions } = req.body;
      const trainerId = (req as any).user.id;

      const enrollment = await Enrollment.findById(enrollmentId);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found",
        });
      }

      if (enrollment.trainerId.toString() !== trainerId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      enrollment.progress.completedSessions = completedSessions;
      enrollment.progress.totalSessions = totalSessions;
      enrollment.progress.lastSessionDate = new Date();

      if (completedSessions >= totalSessions) {
        enrollment.status = "completed";
        enrollment.endDate = new Date();
      }

      await enrollment.save();

      // Emit real-time update to member
      const io = (req as any).app.get("io");
      if (io) {
        io.to(enrollment.memberId.toString()).emit("enrollmentProgressUpdate", {
          enrollmentId: enrollment._id,
          progress: enrollment.progress,
          status: enrollment.status,
        });
      }

      res.status(200).json({
        success: true,
        message: "Progress updated successfully",
        data: enrollment,
      });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Cancel enrollment
  static async cancelEnrollment(req: Request, res: Response) {
    try {
      const { enrollmentId } = req.params;
      const userId = (req as any).user.id;

      const enrollment = await Enrollment.findById(enrollmentId);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: "Enrollment not found",
        });
      }

      if (
        enrollment.trainerId.toString() !== userId &&
        enrollment.memberId.toString() !== userId
      ) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized",
        });
      }

      enrollment.status = "cancelled";
      enrollment.endDate = new Date();
      await enrollment.save();

      // Emit real-time update to both parties
      const io = (req as any).app.get("io");
      if (io) {
        io.to(enrollment.trainerId.toString()).emit("enrollmentCancelled", {
          enrollmentId: enrollment._id,
        });
        io.to(enrollment.memberId.toString()).emit("enrollmentCancelled", {
          enrollmentId: enrollment._id,
        });
      }

      res.status(200).json({
        success: true,
        message: "Enrollment cancelled successfully",
        data: enrollment,
      });
    } catch (error) {
      console.error("Error cancelling enrollment:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
