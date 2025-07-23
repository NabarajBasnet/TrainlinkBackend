import express from "express";
import { loggedInUserDetails } from "../../controllers/usersController/usersController";
const router = express.Router();

router.route("/logged-in-user").get(loggedInUserDetails);
export default router;
