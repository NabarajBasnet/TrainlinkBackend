import ConnectDatabase from "../../config/db";
import User from "../../models/Users/Users";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

export const SignUpUser = async (req: any, res: any) => {
  try {
    await ConnectDatabase();

    const { fullName, email, password, role } = req.body;
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const existenceUser = await User.findOne({ email: email, role: role });
    if (existenceUser) {
      res.status(401).json({
        message: "User is already registered",
        redirect: "/auth",
      });
    }
    const user_id = nanoid(4).toString().toUpperCase();
    const finalData = {
      user_id,
      fullName,
      email,
      password: hashedPassword,
      role,
    };

    const newUser = await new User(finalData);
    await newUser.save();

    res.status(200).json({
      message: "Registration successfull",
      redirect: "/auth",
    });
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const LogInUser = async (req: any, res: any) => {
  try {
    await ConnectDatabase();

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    // Check environment
    const isProd = process.env.NODE_ENV === "production";

    // Set cookie options
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; ${
        isProd ? "Secure; SameSite=None;" : "SameSite=Lax;"
      }`
    );

    return res.status(200).json({
      message: "Login successful",
      redirect: "/dashboard",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const LogOutUser = async (req: any, res: any) => {
  try {
    // Check environment
    const isProd = process.env.NODE_ENV === "production";

    // Clear the cookie by setting it with expired date
    res.setHeader("Set-Cookie", [
      `token=; HttpOnly; Path=/; Max-Age=0; ${
        isProd ? "Secure; SameSite=None;" : "SameSite=Lax;"
      }`,
    ]);

    return res.status(200).json({
      message: "Logout successful",
      redirect: "/auth",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Something went wrong during logout",
    });
  }
};
