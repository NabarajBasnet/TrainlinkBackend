import express from "express";
import {
  addTrainerExperties,
  editFitnessGoals,
  loggedInUserDetails,
  removeFitnessGoal,
  shareFitnessGoal,
  shareHealthCondition,
  updateBioDetails,
  updateCertificationDetails,
  updateUserAvatar,
} from "../../controllers/usersController/usersController";
import upload from "../../middleware/multer";
const router = express.Router();

// Trainer

router.route("/logged-in-user").get(loggedInUserDetails);
router.route("/update-avatar").patch(upload.single("image"), updateUserAvatar);
router.route("/update-user-bio").patch(updateBioDetails);
router.route("/add-trainer-experties").patch(addTrainerExperties);
router.route("/update-user-certifications").patch(updateCertificationDetails);

// Member
router.route("/edit-fitness-goal").patch(editFitnessGoals);
router.route("/remove-fitness-goal").patch(removeFitnessGoal);
router.route("/share-fitness-level").patch(shareFitnessGoal);
router.route("/share-health-condition").patch(shareHealthCondition);

export default router;
