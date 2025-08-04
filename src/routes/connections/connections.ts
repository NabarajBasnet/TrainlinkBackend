import express from "express";
import { ConnectionController } from "../../controllers/connection/connection";

const router = express.Router();

router.route("/get-connections").get(ConnectionController.getMyConnections);

export default router;
