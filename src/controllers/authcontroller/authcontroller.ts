export const SignUpUser = async (req: any, res: any) => {
  try {
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const LogInUser = async (req: any, res: any) => {
  try {
  } catch (error: any) {
    console.log("Error: ", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
