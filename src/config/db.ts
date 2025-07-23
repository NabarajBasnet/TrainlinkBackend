import mongoose from "mongoose";

const ConnectDatabase = async () => {
  try {
    let connectionModeLocal: boolean;
    connectionModeLocal = true; // true will connect to local database in local system

    const connectionStr = process.env.CONNECTION_STRING;
    const connectionStrAtlas = process.env.CONNECTION_STRING_ATLAS;

    if (connectionModeLocal) {
      await mongoose.connect(connectionStr);
    } else {
      await mongoose.connect(connectionStrAtlas);
    }
    console.log(
      `Database connected successfully on ${
        connectionModeLocal === true ? "Local" : "Cloud"
      }.`
    );
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

export default ConnectDatabase;
