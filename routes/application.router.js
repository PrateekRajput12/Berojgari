import express from "express";
import upload from "../middleware/multer.js";
import {
    applyForJob,
    getApplicationsByJob,
    getMyApplications,
    getSelectedApplications,
    updateApplicationStatus,
} from "../controllers/application.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

// ✅ Candidate: apply for job (resume upload)
router.post(
    "/:jobId/apply",
    isAuthenticated,
    authorizeRoles("Candidate"),
    upload.single("resume"),
    applyForJob
);

// ✅ Candidate: my applications
router.get("/my", isAuthenticated, authorizeRoles("Candidate"), getMyApplications);

// ✅ HR: selected applications (for offers dropdown)
router.get("/selected", isAuthenticated, authorizeRoles("HR"), getSelectedApplications);

// ✅ HR/Recruiter: applications for a job
router.get("/job/:jobId", isAuthenticated, authorizeRoles("HR", "Recruiter"), getApplicationsByJob);

// ✅ HR/Recruiter: update application status (keep dynamic routes at end)
router.patch("/:id/status", isAuthenticated, authorizeRoles("HR", "Recruiter"), updateApplicationStatus);

export default router;
