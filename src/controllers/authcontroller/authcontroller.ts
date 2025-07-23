import ConnectDatabase from "../../config/db";
import User from "../../models/Users/Users";

export const SignUpUser = async (req: any, res: any) => {
  try {
    await ConnectDatabase();

    const newUser = await new User(req.body);
    await newUser.save();

    res.status(200).json({
      message: "Registration successfull",
      redirect: "/auth",
    });
  } catch (error: any) {
    console.log("Error: ", error.message);
    res.status(500).json({
      message: error.message,
      error:error.message
    });
  }
};

export const LogInUser = async (req: any, res: any) => {
  try {
    await ConnectDatabase();

    console.log("Login: ", req.body);
    res.status(200).json({
      message: "Login successfull",
      redirect: "/dashboard",
      token: "12345",
    });
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
