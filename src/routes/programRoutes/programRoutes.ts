import express from "express";
import {
  createNewProgram,
  deleteBulkPrograms,
  deleteSingleProgram,
  getMyPrograms,
} from "../../controllers/programControllers/programControllers";
const router = express.Router();

router.route("/create-new-program").post(createNewProgram);
router.route("/get-my-programs").get(getMyPrograms);
router.route("/delete-single-program/:id").post(deleteSingleProgram);
router.route("/delete-bulk-program").post(deleteBulkPrograms);

export default router;
