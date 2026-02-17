import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { createJob, getAllJob, getJobById, closeJob, updateJob } from "../controllers/job.controller.js";

const router = express.Router();

router.post("/create", isAuthenticated, authorizeRoles("HR"), createJob);

// public
router.get("/all", getAllJob);

// HR update/close
router.put("/update/:id", isAuthenticated, authorizeRoles("HR"), updateJob);
router.patch("/:id/close", isAuthenticated, authorizeRoles("HR"), closeJob);

// public
router.get("/:id", getJobById);

export default router;
