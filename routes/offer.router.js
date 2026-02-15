import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import express from 'express'
import { acceptOffer, createOffer, getAllOffers, getMyOffers, rejectOffer } from "../controllers/Offer.controller.js";
const router = express.Router()


router.post("/", isAuthenticated, authorizeRoles("HR"), createOffer)
router.get("/", isAuthenticated, authorizeRoles("HR", "Candidate"), getAllOffers)

router.patch("/:id/accept", isAuthenticated, authorizeRoles("Candidate"), acceptOffer)
router.patch("/:id/reject", isAuthenticated, authorizeRoles("Candidate"), rejectOffer)

router.get("/my", isAuthenticated, authorizeRoles("Candidate"), getMyOffers)

export default router