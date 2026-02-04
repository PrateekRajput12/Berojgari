import express from 'express'
import upload from '../middleware/multer.js'
import { applyForJob, getApplicationsByJob, updateApplicationStatus } from '../controllers/application.controller.js'
import isAuthenticated from '../middleware/isAuthenticated.js'
import authorizeRoles from '../middleware/authorizeRoles.js'

const router = express.Router()


router.post('/:jobId/apply', upload.single("resume"), applyForJob)


router.get("/job/:jobId", isAuthenticated, authorizeRoles("HR", "Recruiter"), getApplicationsByJob)
router.patch("/:id/status", isAuthenticated, authorizeRoles("HR", "Recruiter"), updateApplicationStatus)

export default router