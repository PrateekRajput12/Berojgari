import { createJob, getAllJob, getJobById, closeJob, updateJob } from "../controllers/job.controller.js";
import express from 'express'
import authorizeRoles from "../middleware/authorizeRoles.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
const router = express.Router()

router.post('/create', isAuthenticated, authorizeRoles('HR'), createJob)
router.get("/all", getAllJob)
router.get("/:id", getJobById)
router.put("/update/:id", isAuthenticated, authorizeRoles("HR"), updateJob)
router.patch("/:id/close", isAuthenticated, authorizeRoles('HR'), closeJob)


export default router