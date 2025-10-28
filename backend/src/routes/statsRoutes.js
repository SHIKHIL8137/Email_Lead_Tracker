import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getStats } from "../controllers/statsController.js";

const router = express.Router();
router.use(authenticate);
router.get("/", getStats);

export default router;
