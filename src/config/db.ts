import mongoose from "mongoose";

const ConnectDatabase = async () => {
  try {
    let connectionModeLocal: boolean;
    connectionModeLocal = true; // true will connect to local database in local system

    const connectionStr = process.env.CONNECTION_STRING;
    const connectionStrAtlas = process.env.CONNECTION_STRING_ATLAS;

    if (!connectionStr && !connectionStrAtlas) {
      throw new Error(
        "No database connection string provided in environment variables"
      );
    }

    if (connectionModeLocal) {
      if (!connectionStr) {
        throw new Error("Local connection string not provided");
      }
      await mongoose.connect(connectionStr);
    } else {
      if (!connectionStrAtlas) {
        throw new Error("Atlas connection string not provided");
      }
      await mongoose.connect(connectionStrAtlas);
    }

    console.log(
      `Database connected successfully on ${
        connectionModeLocal === true ? "Local" : "Cloud"
      }.`
    );

    // Test the connection
    const db = mongoose.connection;
    db.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    db.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
};

export default ConnectDatabase;
