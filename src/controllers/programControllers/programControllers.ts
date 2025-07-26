import { Request, Response } from "express";
import ConnectDatabase from "../../config/db";
import jwt from "jsonwebtoken";
import User from "../../models/Users/Users";
import { Program } from "../../models/TrainerProgram/TrainerProgram";

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

export const deleteSingleProgram = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();
    console.log(req.body);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteBulkPrograms = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();
    console.log(req.body);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
