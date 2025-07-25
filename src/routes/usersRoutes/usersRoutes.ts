import express from "express";
import {
  addTrainerExperties,
  loggedInUserDetails,
  updateBioDetails,
  updateCertificationDetails,
} from "../../controllers/usersController/usersController";
const router = express.Router();

router.route("/logged-in-user").get(loggedInUserDetails);
router.route("/update-user-bio").patch(updateBioDetails);
router.route("/add-trainer-experties").patch(addTrainerExperties);
router.route("/update-user-certifications").patch(updateCertificationDetails);

export default router;
