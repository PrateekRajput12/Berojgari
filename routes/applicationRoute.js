import express from "express";
import isAuthenticated from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorize.js";
import uploadResume from "../middleware/uploadResume.js";
import { applyJob } from "../controllers/applicationController.js";

const router = express.Router();

router.post(
    "/apply/:jobId",
    isAuthenticated,
    authorizeRoles("Interviewer"),
    uploadResume.single("resume"),
    applyJob
);

export default router;
