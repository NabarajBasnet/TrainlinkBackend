import { Response, Request } from "express";
import ConnectDatabase from "../../config/db";
import ConnectionModel from "../../models/ConnectionModels/ConnectionModel";
import jwt from "jsonwebtoken";
import User from "../../models/Users/Users";

export class ConnectionController {
  static getMyConnections = async (req: Request, res: Response) => {
    try {
      await ConnectDatabase();
      const jwt_secret = process.env.JWT_SECRET;
      const token = req.cookies.token;
      const loggedInUser = jwt.verify(token, jwt_secret);
      const { id } = loggedInUser;
      const user = await User.findById(id);
      const userRole = user.role;

      const baseQuery = {};
      if (userRole === "Trainer") {
        baseQuery.trainerId = user._id;
      } else {
        clientId: user._id;
      }

      const myConnections = await ConnectionModel.find(baseQuery)
        .populate("clientId")
        .populate("trainerId")
        .populate("source")
        .populate("blockedBy");

      const chatList = myConnections.map((conn) => ({
        connectionId: conn._id,
        user: userRole === "Trainer" ? conn.clientId : conn.trainerId,
        lastEngagementAt: conn.lastEngagementAt,
        chatEnabled: conn.chatEnabled,
      }));

      res.status(200).json({
        message: "Connections returned",
        myConnections,
        chatList,
      });
    } catch (error: any) {
      console.log("Error: ", error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  };
}
