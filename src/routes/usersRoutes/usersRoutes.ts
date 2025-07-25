import express from "express";
import {
  addTrainerExperties,
  loggedInUserDetails,
} from "../../controllers/usersController/usersController";
const router = express.Router();

router.route("/logged-in-user").get(loggedInUserDetails);

router.route("/add-trainer-experties").patch(addTrainerExperties);

export default router;
