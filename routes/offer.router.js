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

const router = express.Router();

// ✅ Candidate: My offers (keep static routes first)
router.get("/my", isAuthenticated, authorizeRoles("Candidate"), getMyOffers);

// ✅ HR: create offer + view all offers
router.post("/", isAuthenticated, authorizeRoles("HR"), createOffer);
router.get("/", isAuthenticated, authorizeRoles("HR"), getAllOffers);

// ✅ Candidate: accept / reject offer
router.patch("/:id/accept", isAuthenticated, authorizeRoles("Candidate"), acceptOffer);
router.patch("/:id/reject", isAuthenticated, authorizeRoles("Candidate"), rejectOffer);

export default router;
