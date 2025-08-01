import ConnectDatabase from "../../config/db";
import jwt from "jsonwebtoken";
import User from "../../models/Users/Users";
import fs from "fs";
import { log } from "console";
import { Request, Response } from "express";
import uploadOnCloudinary from "../../utils/ImageUpload/cloudinary";

export const loggedInUserDetails = async (req: Request, res: Response) => {
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

export async function updateUserAvatar(req: Request, res: Response) {
  try {
    await ConnectDatabase();
    const loggedInUser = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const { id } = loggedInUser;
    const user = await User.findById(id);

    // check if file exists (multer added)
    const localPath = req.file?.path;
    if (!localPath) {
      return res.status(400).json({ message: "No file received" });
    }

    // Upload to cloudinary
    const cloudinaryResult = await uploadOnCloudinary(localPath);

    if (!cloudinaryResult) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    const { secure_url } = cloudinaryResult;
    user.avatarUrl = secure_url;
    await user.save();

    // Respond with uploaded URL
    res.status(200).json({
      message: "Image uploaded successfully",
      url: cloudinaryResult.secure_url,
    });

    // ✅ Clean up temp file
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  } catch (error: any) {
    log(error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export const addTrainerExperties = async (req: Request, res: Response) => {
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
    user.setupStage = 2;
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

export const updateBioDetails = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();

    const JWT_TOKEN = process.env.JWT_SECRET;
    if (!JWT_TOKEN) throw new Error("JWT_SECRET is not defined in env");

    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const loggedInUser = jwt.verify(token, JWT_TOKEN) as { id: string };
    const { id } = loggedInUser;
    const { userBio } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "Trainer") {
      if (!user.trainerProfile) user.trainerProfile = {};
      user.trainerProfile.bio = userBio;
      user.trainerProfile.setupStage = 2;
    } else {
      if (!user.memberProfile) user.memberProfile = {};
      user.memberProfile.fitnessJourney = userBio;
      user.memberProfile.setupStage = 2;
    }

    await user.save();

    res.status(200).json({
      message: "Your changes are saved successfully",
    });
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

export const updateCertificationDetails = async (
  req: Request,
  res: Response
) => {
  try {
    await ConnectDatabase();

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

    // Get the user from database
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the request body
    const { certifications } = req.body;
    if (!certifications || !Array.isArray(certifications)) {
      return res.status(400).json({ message: "Invalid certifications data" });
    }

    // Update certifications
    user.trainerProfile.certifications = certifications.map((cert) => ({
      name: cert.name,
      issuingOrganization: cert.issuingOrganization,
      yearObtained: cert.yearObtained,
      certificationId: cert.certificationId,
      isVerified: cert.isVerified || false,
      url: cert.url || "-",
    }));

    // Mark setup stage as complete if not already
    if (user.trainerProfile.setupStage < 3) {
      user.trainerProfile.setupStage = 3;
    }

    await user.save();

    res.status(200).json({
      message: "Certifications updated successfully",
      certifications: user.trainerProfile.certifications,
    });
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message || "Failed to update certifications",
    });
  }
};

// Members conrollers
export const editFitnessGoals = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();

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

    // Get the user from database
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let arr = [];
    let prevGoals = user.memberProfile.goals;
    arr.push(...prevGoals, req.body[0]);
    user.memberProfile.goals = arr;
    await user.save();

    res.status(200).json({
      message: "Your changes are saved successfully",
    });
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message || "Failed to update certifications",
    });
  }
};

export const removeFitnessGoal = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();

    const JWT_TOKEN = process.env.JWT_SECRET;
    if (!JWT_TOKEN) {
      throw new Error("JWT_SECRET is not defined in env");
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const loggedInUser = jwt.verify(token, JWT_TOKEN) as { id: string };
    const { id } = loggedInUser;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { goal: goalToRemove } = req.body;

    const userRole = user.role;
    if (userRole === "Member") {
      const prevGoals = user.memberProfile.goals || [];
      const updatedGoals = prevGoals.filter(
        (goal: string) => !goalToRemove.includes(goal)
      );
      user.memberProfile.goals = updatedGoals;
      await user.save();
    } else {
      const prevExperties = user.trainerProfile.experties || [];
      const updatedGoals = prevExperties.filter(
        (goal: string) => !goalToRemove.includes(goal)
      );
      user.trainerProfile.experties = updatedGoals;
      await user.save();
    }

    res.status(200).json({
      message: "Goal(s) removed successfully",
    });
  } catch (error: any) {
    console.error("Error: ", error);
    res.status(500).json({
      message: error.message || "Failed to remove fitness goals",
    });
  }
};

export const shareFitnessGoal = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();

    const JWT_TOKEN = process.env.JWT_SECRET;
    if (!JWT_TOKEN) {
      throw new Error("JWT_SECRET is not defined in env");
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const loggedInUser = jwt.verify(token, JWT_TOKEN) as { id: string };
    const { id } = loggedInUser;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.memberProfile.fitnessLevel = req.body[0];
    await user.save();

    res.status(200).json({
      message: "Your changes are saved successfully",
    });
  } catch (error: any) {
    console.error("Error: ", error);
    res.status(500).json({
      message: error.message || "Failed to remove fitness goals",
    });
  }
};

export const shareHealthCondition = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();

    const JWT_TOKEN = process.env.JWT_SECRET;
    if (!JWT_TOKEN) {
      throw new Error("JWT_SECRET is not defined in env");
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const loggedInUser = jwt.verify(token, JWT_TOKEN) as { id: string };
    const { id } = loggedInUser;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.memberProfile.healthCondition = req.body[0];
    user.memberProfile.setupStage = 3;
    await user.save();

    res.status(200).json({
      message: "Your changes are saved successfully",
    });
  } catch (error: any) {
    console.error("Error: ", error);
    res.status(500).json({
      message: error.message || "Failed to remove fitness goals",
    });
  }
};

export const changePersonalDetails = async (req: Request, res: Response) => {
  try {
    await ConnectDatabase();

    const JWT_TOKEN = process.env.JWT_SECRET;
    if (!JWT_TOKEN) {
      throw new Error("JWT_SECRET is not defined in env");
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const loggedInUser = jwt.verify(token, JWT_TOKEN) as { id: string };
    const { id } = loggedInUser;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { fullName, email, contactNo, location, facebook, instagram } =
      req.body;
    user.fullName = fullName;
    user.email = email;
    user.contactNo = contactNo;
    user.location = location;
    user.socialMedia = [
      { platform: "facebook", url: facebook },
      { platform: "instagram", url: instagram },
    ];
    await user.save();

    res.status(200).json({
      message: "Your changes are saved successfully",
    });
  } catch (error: any) {
    console.error("Error: ", error);
    res.status(500).json({
      message: error.message || "Failed to remove fitness goals",
    });
  }
};
