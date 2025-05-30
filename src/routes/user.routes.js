import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/home", protect, (req, res) => {
  res.status(200).json({
    message: "User profile",
    user: req.user,
  });
});

export default router;
