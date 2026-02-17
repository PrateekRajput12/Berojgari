import Application from "../models/application.model.js";
import Offer from "../models/Offer.model.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";

// ✅ HR: Create Offer
export const createOffer = async (req, res) => {
    try {
        const { applicationId, salary, joiningDate, validTill } = req.body;

        if (!applicationId || !salary || !joiningDate || !validTill) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ message: "Application not found" });

        // ✅ Offer should be after final interview pass
        if (application.status !== "Selected") {
            return res.status(400).json({ message: "Candidate not eligible for offer" });
        }

        // ✅ prevent sending offer twice for same application
        const existingOffer = await Offer.findOne({ application: applicationId });
        if (existingOffer) {
            return res.status(400).json({ message: "Offer already sent for this application" });
        }

        const offer = await Offer.create({
            application: applicationId,
            salary,
            joiningDate,
            validTill,
            // status default: "Sent"
        });

        // ✅ Email candidate (candidate is EMBEDDED)
        try {
            await sendEmail({
                to: application.candidate.email,
                subject: "Offer Letter",
                html: `
          <p>Hi ${application.candidate.name},</p>
          <p>We are pleased to offer you the position.</p>
          <p><b>Salary:</b> ₹${salary}</p>
          <p><b>Joining Date:</b> ${new Date(joiningDate).toDateString()}</p>
          <p>Please accept/reject before ${new Date(validTill).toDateString()}.</p>
        `,
            });
        } catch (error) {
            console.log("Email failed:", error.message);
        }

        return res.status(201).json({ message: "Offer created successfully", offer });
    } catch (error) {
        console.log("Create offer error:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Candidate: Accept Offer
export const acceptOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });

        // already final states
        if (offer.status === "Accepted") return res.status(400).json({ message: "Offer already accepted" });
        if (offer.status === "Rejected") return res.status(400).json({ message: "Offer already rejected" });

        // expired check
        if (new Date() > offer.validTill) {
            offer.status = "Expired";
            await offer.save();
            return res.status(400).json({ message: "Offer expired" });
        }

        if (offer.status !== "Sent") {
            return res.status(400).json({ message: `Cannot accept offer with status ${offer.status}` });
        }

        const application = await Application.findById(offer.application);
        if (!application) return res.status(404).json({ message: "Application not found" });

        // ✅ Ownership check using EMAIL (because embedded candidate)
        if (application.candidate.email !== req.user.email) {
            return res.status(403).json({ message: "Not allowed to accept this offer" });
        }

        // ✅ update offer + application
        offer.status = "Accepted";
        await offer.save();

        application.status = "Hired";
        await application.save();

        // ✅ Notify HR (optional)
        try {
            const hrUsers = await User.find({ role: "HR" }).select("email");
            for (const hr of hrUsers) {
                await sendEmail({
                    to: hr.email,
                    subject: "Offer Response Update",
                    html: `
            <p>Candidate has accepted the offer.</p>
            <p>Application ID: ${offer.application}</p>
          `,
                });
            }
        } catch (error) {
            console.log("Email failed:", error.message);
        }

        return res.status(200).json({ message: "Offer accepted successfully", offer });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Candidate: Reject Offer
export const rejectOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });

        if (offer.status === "Rejected") return res.status(400).json({ message: "Offer already rejected" });
        if (offer.status === "Accepted") return res.status(400).json({ message: "Offer already accepted. Cannot reject now." });

        if (new Date() > offer.validTill) {
            offer.status = "Expired";
            await offer.save();
            return res.status(400).json({ message: "Offer expired" });
        }

        if (offer.status !== "Sent") {
            return res.status(400).json({ message: `Cannot reject offer with status ${offer.status}` });
        }

        const application = await Application.findById(offer.application);
        if (!application) return res.status(404).json({ message: "Application not found" });

        // ✅ Ownership check using EMAIL
        if (application.candidate.email !== req.user.email) {
            return res.status(403).json({ message: "Not allowed to reject this offer" });
        }

        offer.status = "Rejected";
        await offer.save();

        // ✅ Notify HR
        try {
            const hrUsers = await User.find({ role: "HR" }).select("email");
            for (const hr of hrUsers) {
                await sendEmail({
                    to: hr.email,
                    subject: "Offer Response Update",
                    html: `
            <p>Candidate has rejected the offer.</p>
            <p>Application ID: ${offer.application}</p>
          `,
                });
            }
        } catch (error) {
            console.log("Email failed:", error.message);
        }

        return res.status(200).json({ message: "Offer rejected successfully", offer });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ HR: Get All Offers
export const getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find()
            .populate({
                path: "application",
                populate: { path: "job", select: "title location" },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ offers, message: "Fetched Offers" }); // ✅ offers key
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ✅ Candidate: Get My Offers (embedded candidate -> filter using email)
export const getMyOffers = async (req, res) => {
    try {
        const offers = await Offer.find()
            .populate({
                path: "application",
                populate: { path: "job", select: "title location" },
            })
            .sort({ createdAt: -1 });

        const myOffers = offers.filter((o) => o.application?.candidate?.email === req.user.email);

        return res.status(200).json({ offers: myOffers });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
