import express, { Router } from "express";

const router = express.Router();

import { register, login, logout, currentUser, forgotPassword } from "../controllers/auth";
import { requireSignin } from "../middleware";

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-user", requireSignin, currentUser);
router.post("/forgot-password", forgotPassword);

module.exports = router;