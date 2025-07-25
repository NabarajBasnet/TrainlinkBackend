import express from "express";
import {
  LogInUser,
  LogOutUser,
  SignUpUser,
} from "../../controllers/authcontroller/authcontroller";
const router = express.Router();

router.post("/auth/signup", SignUpUser);
router.post("/auth/login", LogInUser);
router.post("/auth/logout", LogOutUser);

export default router;
