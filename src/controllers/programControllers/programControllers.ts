import { Request, Response } from "express";
import { Program } from "../../models/Programs/Programs";

// Create new program
export const createProgram = async (req: Request, res: Response) => {
  try {
    const trainerId = req.user?.id;

    if (!trainerId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (req.user?.role !== "Trainer") {
      return res.status(403).json({
        success: false,
        message: "Only trainers can create programs",
      });
    }

    const programData = {
      ...req.body,
      trainerId,
      availableSlots: req.body.maxSlot,
      status: req.body.status || 'Active', // Add default status
    };

    const newProgram = new Program(programData);
    const savedProgram = await newProgram.save();

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: savedProgram,
    });
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all programs (for marketplace)
export const getAllPrograms = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = { status: "Active" };

    // Apply filters
    if (category) query.category = category;
    if (level) query.level = level;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const programs = await Program.find(query)
      .populate("trainerId", "fullName email avatarUrl trainerProfile")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Program.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Programs fetched successfully",
      programs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get programs by trainer
export const getMyPrograms = async (req: Request, res: Response) => {
  try {
    const trainerId = req.user?.id;

    if (!trainerId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const programs = await Program.find({ trainerId })
      .populate("trainerId", "fullName email avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Programs fetched successfully",
      programs,
    });
  } catch (error) {
    console.error("Error fetching trainer programs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single program by ID
export const getProgramById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const program = await Program.findById(id)
      .populate("trainerId", "fullName email avatarUrl trainerProfile")
      .populate("reviews.userId", "fullName avatarUrl");

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    // Increment views
    await Program.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      message: "Program fetched successfully",
      program,
    });
  } catch (error) {
    console.error("Error fetching program:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update program
export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trainerId = req.user?.id;

    if (!trainerId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const program = await Program.findOne({ _id: id, trainerId });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found or you don't have permission to edit it",
      });
    }

    // Update availableSlots if maxSlot is being updated
    const updateData = { ...req.body };
    if (req.body.maxSlot) {
      updateData.availableSlots = req.body.maxSlot;
    }

    const updatedProgram = await Program.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("trainerId", "fullName email avatarUrl");

    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      program: updatedProgram,
    });
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete program
export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trainerId = req.user?.id;

    if (!trainerId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const program = await Program.findOne({ _id: id, trainerId });

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found or you don't have permission to delete it",
      });
    }

    await Program.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Toggle favorite
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const program = await Program.findById(programId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    const isFavorited = program.favorites.includes(userId);

    if (isFavorited) {
      await Program.findByIdAndUpdate(programId, {
        $pull: { favorites: userId },
      });
    } else {
      await Program.findByIdAndUpdate(programId, {
        $addToSet: { favorites: userId },
      });
    }

    res.status(200).json({
      success: true,
      message: isFavorited ? "Removed from favorites" : "Added to favorites",
      isFavorited: !isFavorited,
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user's favorite programs
export const getFavoritePrograms = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const programs = await Program.find({
      favorites: userId,
      status: "Active",
    })
      .populate("trainerId", "fullName email avatarUrl trainerProfile")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Favorite programs fetched successfully",
      programs,
    });
  } catch (error) {
    console.error("Error fetching favorite programs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete multiple programs
export const deleteMultiplePrograms = async (req: Request, res: Response) => {
  try {
    const { programIds } = req.body;
    const trainerId = req.user?.id;

    if (!trainerId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!Array.isArray(programIds) || programIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Program IDs array is required",
      });
    }

    const result = await Program.deleteMany({
      _id: { $in: programIds },
      trainerId,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} program(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting programs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
