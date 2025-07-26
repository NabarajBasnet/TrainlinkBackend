import { Request, Response } from "express";
import ConnectDatabase from "../../config/db";
import jwt from "jsonwebtoken";
import User from "../../models/Users/Users";
import { Program } from "../../models/Programs/Programs";

export const createNewProgram = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = req.cookies.token;
    const loggedInUser = jwt.verify(token, JWT_SECRET);
    const { id } = loggedInUser;
    const user = await User.findById(id);
    const userRole = user.role;
    const body = req.body;
    const payload = { trainerId: id, ...body };

    if (userRole === "Trainer") {
      const newProgram = await new Program(payload);
      await newProgram.save();
    }

    res.status(200).json({
      message: "Your changes are saved successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyPrograms = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = req.cookies.token;
    const loggedInUser = jwt.verify(token, JWT_SECRET);
    const { id } = loggedInUser;

    const baseQuery = {};
    if (id) {
      baseQuery.trainerId = id;
    }

    const programs = await Program.find(baseQuery)
      .sort({ createdAt: -1 })
      .populate("trainerId");
    res.status(200).json({
      programs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteSelectedPrograms = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();
    const { programIds } = req.body;
    await Program.deleteMany({
      _id: { $in: programIds },
    });

    res.status(200).json({
      message: "Selected documents are deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const editProgram = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();

    const { _id, ...updateData } = req.body.data;

    if (!_id) {
      return res.status(400).json({ message: "Program ID is required" });
    }

    const updatedProgram = await Program.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProgram) {
      return res.status(404).json({ message: "Program not found" });
    }

    res.status(200).json({
      message: "Program updated successfully",
      program: updatedProgram,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
