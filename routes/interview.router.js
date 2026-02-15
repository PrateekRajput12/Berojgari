import express from 'express'
const router = express.Router()
import isAuthenticated from '../middleware/isAuthenticated.js'
import authorizeRoles from '../middleware/authorizeRoles.js'
import { getInterviewsByApplication, getMyInterviews, scheduleInterview, submitInterviewFeedback } from '../controllers/interview.controller.js'


router.post("/schedule", isAuthenticated, authorizeRoles("HR", "Recruiter"), scheduleInterview)
router.patch("/:id/feedback", isAuthenticated, authorizeRoles("Interviewer"), submitInterviewFeedback)
router.get("/application/:applicationId", isAuthenticated, authorizeRoles("HR", "Recruiter"), getInterviewsByApplication)
router.get(
    "/my",
    isAuthenticated,
    authorizeRoles("Interviewer"),
    getMyInterviews
);


export default router