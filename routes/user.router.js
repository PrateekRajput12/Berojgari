import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import {
    acceptOffer,
    createOffer,
    getAllOffers,
    getMyOffers,
    rejectOffer,
} from "../controllers/Offer.controller.js";
import { getInterviewers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/interviewers", isAuthenticated, authorizeRoles("HR", "Recruiter"), getInterviewers)
export default router;
