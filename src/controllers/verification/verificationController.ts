import { Request, Response } from "express";
import User from "../../models/Users/Users";

// Apply for verification
export const applyForVerification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "Trainer") {
      return res.status(403).json({
        success: false,
        message: "Only trainers can apply for verification",
      });
    }

    // Check if already verified or has pending application
    if (user.trainerProfile?.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    if (user.trainerProfile?.verificationStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Verification application already pending",
      });
    }

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.governmentId) {
      return res.status(400).json({ message: "Government ID is required" });
    }

    const governmentIdUrl = files.governmentId[0].path;
    const businessLicenseUrl = files.businessLicense
      ? files.businessLicense[0].path
      : undefined;

    // Update user with verification application
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        "trainerProfile.verificationStatus": "pending",
        "trainerProfile.verificationApplication": {
          submittedAt: new Date(),
          documents: {
            governmentId: governmentIdUrl,
            businessLicense: businessLicenseUrl,
          },
          ...req.body,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Verification application submitted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error applying for verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get verification applications (Admin only)
export const getVerificationApplications = async (
  req: Request,
  res: Response
) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const applications = await User.find({
      "trainerProfile.verificationStatus": { $exists: true },
      "trainerProfile.verificationApplication": { $exists: true },
    }).select("fullName email trainerProfile");

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching verification applications:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update verification status (Admin only)
export const updateVerificationStatus = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body;

    const user = await User.findById(applicationId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData: any = {
      "trainerProfile.verificationStatus": status,
      "trainerProfile.verificationApplication.reviewedAt": new Date(),
      "trainerProfile.verificationApplication.reviewedBy": req.user.id,
    };

    if (status === "approved") {
      updateData["trainerProfile.isVerified"] = true;
    } else if (status === "rejected" && rejectionReason) {
      updateData["trainerProfile.verificationApplication.rejectionReason"] =
        rejectionReason;
    }

    const updatedUser = await User.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Verification application ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
