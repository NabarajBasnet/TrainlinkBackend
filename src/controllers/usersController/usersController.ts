import ConnectDatabase from "../../config/db";
import jwt from "jsonwebtoken";
import User from "../../models/Users/Users";

export const loggedInUserDetails = async (req: any, res: any) => {
  try {
    await ConnectDatabase();

    // Read secret here after dotenv.config() has loaded
    const JWT_TOKEN = process.env.JWT_SECRET;
    if (!JWT_TOKEN) {
      throw new Error("JWT_SECRET is not defined in env");
    }

    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const loggedInUser = jwt.verify(token, JWT_TOKEN);
    const { id } = loggedInUser;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addTrainerExperties = async (req: any, res: any) => {
  try {
    await ConnectDatabase();

    // Read secret here after dotenv.config() has loaded
    const JWT_TOKEN = process.env.JWT_SECRET;
    if (!JWT_TOKEN) {
      throw new Error("JWT_SECRET is not defined in env");
    }

    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const loggedInUser = jwt.verify(token, JWT_TOKEN);
    const { id } = loggedInUser;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userExperties = user.trainerProfile.experties;
    let expertiesArr = [];

    expertiesArr.push(...userExperties, req.body[0]);
    user.trainerProfile.experties = expertiesArr;
    await user.save();

    res.status(200).json({
      message: "Your changes are saved successfully.",
    });
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
