import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import {
    getCandidateInterviews,
    getInterviewsByApplication,
    getMyInterviews,
    scheduleInterview,
    submitInterviewFeedback,
} from "../controllers/interview.controller.js";

const router = express.Router();

// HR/Recruiter
router.post("/schedule", isAuthenticated, authorizeRoles("HR", "Recruiter"), scheduleInterview);
router.get("/application/:applicationId", isAuthenticated, authorizeRoles("HR", "Recruiter"), getInterviewsByApplication);

// Interviewer
router.get("/my", isAuthenticated, authorizeRoles("Interviewer"), getMyInterviews);
router.patch("/:id/feedback", isAuthenticated, authorizeRoles("Interviewer"), submitInterviewFeedback);
router.get(
    "/candidate/my",
    isAuthenticated,
    authorizeRoles("Candidate"),
    getCandidateInterviews
);

export default router;
