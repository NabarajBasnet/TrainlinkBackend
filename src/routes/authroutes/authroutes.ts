import express from "express";
import {
  LogInUser,
  SignUpUser,
} from "../../controllers/authcontroller/authcontroller";
const router = express.Router();

router.post("/auth/signup", SignUpUser);
router.post("/auth/login", LogInUser);

export default router;
