import express from "express";
import isAuthenticated from "../middleware/auth.js";
import authorizeRoles from "../middleware/authorize.js";
import {
    createJob,
    getAllJobs
} from "../controllers/jobcontroller.js";

const router = express.Router();

router.post(
    "/create",
    isAuthenticated,
    authorizeRoles("HR", "Manager"),
    createJob
);

router.get("/all", getAllJobs);

export default router;
