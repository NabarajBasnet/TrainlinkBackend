import express from "express";
import {
  createNewProgram,
  deleteSelectedPrograms,
  editProgram,
  getMyPrograms,
} from "../../controllers/programControllers/programControllers";
const router = express.Router();

router.route("/create-new-program").post(createNewProgram);
router.route("/get-my-programs").get(getMyPrograms);
router.route("/delete-programs").delete(deleteSelectedPrograms);
router.route("/edit-program").put(editProgram);

export default router;
