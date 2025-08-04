import { Request, Response } from "express";
import { TrainingRequest } from "../../models/TrainingRequestModel/TrainingRequestModel";

// Create new training request
export const createNewTrainingRequest = async (req: Request, res: Response) => {
  try {
    const {
      goal,
      description,
      preferredDaysPerWeek,
      budgetPerWeek,
      availableTimeSlots,
      status,
    } = req.body;
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (req.user?.role !== "Member") {
      return res.status(403).json({
        success: false,
        message: "Only members can create training requests",
      });
    }

    const newTrainingRequest = new TrainingRequest({
      memberId,
      goal,
      description,
      preferredDaysPerWeek,
      budgetPerWeek,
      availableTimeSlots,
      status: status || "Active",
    });

    const savedRequest = await newTrainingRequest.save();

    res.status(201).json({
      success: true,
      message: "Training request created successfully",
      data: savedRequest,
    });
  } catch (error: any) {
    console.error("Error creating training request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all training requests for a user
export const getMyTrainingRequests = async (req: Request, res: Response) => {
  try {
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const trainingRequests = await TrainingRequest.find({ memberId })
      .populate("memberId", "fullName email avatarUrl memberProfile")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Training requests fetched successfully",
      trainingRequests,
    });
  } catch (error: any) {
    console.error("Error fetching training requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all training requests for marketplace (trainers can see member requests)
export const getAllTrainingRequests = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      minBudget,
      maxBudget,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = { status: "Active" };

    // Apply filters
    if (minBudget || maxBudget) {
      query.budgetPerWeek = {};
      if (minBudget) query.budgetPerWeek.$gte = Number(minBudget);
      if (maxBudget) query.budgetPerWeek.$lte = Number(maxBudget);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { goal: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const trainingRequests = await TrainingRequest.find(query)
      .populate("memberId", "fullName email avatarUrl memberProfile")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await TrainingRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Training requests fetched successfully",
      trainingRequests,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching all training requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single training request by ID
export const getTrainingRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const trainingRequest = await TrainingRequest.findOne({
      _id: id,
      memberId,
    }).populate("memberId", "fullName email avatarUrl memberProfile");

    if (!trainingRequest) {
      return res.status(404).json({
        success: false,
        message: "Training request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Training request fetched successfully",
      trainingRequest,
    });
  } catch (error: any) {
    console.error("Error fetching training request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single training request by ID (for marketplace - trainers can view any request)
export const getTrainingRequestByIdPublic = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const trainingRequest = await TrainingRequest.findById(id).populate(
      "memberId",
      "fullName email avatarUrl memberProfile"
    );

    if (!trainingRequest) {
      return res.status(404).json({
        success: false,
        message: "Training request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Training request fetched successfully",
      trainingRequest,
    });
  } catch (error: any) {
    console.error("Error fetching training request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update training request
export const updateTrainingRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      goal,
      description,
      preferredDaysPerWeek,
      budgetPerWeek,
      availableTimeSlots,
      status,
    } = req.body;
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const trainingRequest = await TrainingRequest.findOne({
      _id: id,
      memberId,
    });

    if (!trainingRequest) {
      return res.status(404).json({
        success: false,
        message: "Training request not found",
      });
    }

    const updatedRequest = await TrainingRequest.findByIdAndUpdate(
      id,
      {
        goal,
        description,
        preferredDaysPerWeek,
        budgetPerWeek,
        availableTimeSlots,
        status,
      },
      { new: true }
    ).populate("memberId", "fullName email avatarUrl memberProfile");

    res.status(200).json({
      success: true,
      message: "Training request updated successfully",
      trainingRequest: updatedRequest,
    });
  } catch (error: any) {
    console.error("Error updating training request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete single training request
export const deleteTrainingRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const trainingRequest = await TrainingRequest.findOne({
      _id: id,
      memberId,
    });

    if (!trainingRequest) {
      return res.status(404).json({
        success: false,
        message: "Training request not found",
      });
    }

    await TrainingRequest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Training request deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting training request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete multiple training requests
export const deleteMultipleTrainingRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const { requestIds } = req.body;
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid request IDs",
      });
    }

    // Verify all requests belong to the user
    const requests = await TrainingRequest.find({
      _id: { $in: requestIds },
      memberId,
    });

    if (requests.length !== requestIds.length) {
      return res.status(403).json({
        success: false,
        message: "Some requests do not belong to you or do not exist",
      });
    }

    await TrainingRequest.deleteMany({ _id: { $in: requestIds } });

    res.status(200).json({
      success: true,
      message: `${requestIds.length} training request(s) deleted successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting multiple training requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
