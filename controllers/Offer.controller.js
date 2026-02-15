import Application from "../models/application.model.js";
import Offer from "../models/Offer.model.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";

export const createOffer = async (req, res) => {
    try {
        const { applicationId, salary, joiningDate, validTill } = req.body;
        if (!applicationId || !salary || !joiningDate || !validTill) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const application = await Application.findById(applicationId)

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status !== "Shortlisted") {
            return res.status(400).json({ message: "Candidate not eligible for offer" })
        }

        const offer = await Offer.create({
            application: applicationId,
            salary,
            joiningDate,
            validTill,

        })

        await sendEmail({
            to: application.candidate.email,
            subject: 'Offer Letter',
            html: `
              <p>Hi ${application.candidate.name},</p>
    <p>We are pleased to offer you the position.</p>
    <p><b>Salary:</b> ₹${salary}</p>
    <p><b>Joining Date:</b> ${new Date(joiningDate).toDateString()}</p>
    <p>Please respond before ${new Date(validTill).toDateString()}.</p>
            `
        })
        res.status(201).json({
            message: "Offer created successfully", offer
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}


// export const acceptOffer = async (req, res) => {
//     try {
//         const offer = await Offer.findById(req.params.id)

//         if (!offer) {
//             return res.status(404).json({ message: "Offer not found" });
//         }

//         if (new Date() > offer.validTill) {
//             offer.status = "Expired",
//                 await offer.save()
//             return res.status(400).json({ message: "Offer Expired" })
//         }

//         offer.status = "Accepted"
//         await offer.save()
//         res.status(200).json({ message: "Offer accepted" })
//     } catch (error) {
//         res.status(400).json({ message: error.message })
//     }
// }
export const acceptOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        // Check if already accepted
        if (offer.status === "Accepted") {
            return res.status(400).json({
                message: "Offer already accepted",
            });
        }

        // Check if already rejected
        if (offer.status === "Rejected") {
            return res.status(400).json({
                message: "Offer already rejected",
            });
        }

        // Check if expired
        if (new Date() > offer.validTill) {
            offer.status = "Expired";
            await offer.save();
            return res.status(400).json({
                message: "Offer expired",
            });
        }

        // Only Pending can be accepted
        if (offer.status !== "Sent") {
            return res.status(400).json({
                message: "Invalid offer status",
            });
        }

        offer.status = "Accepted";
        await offer.save();

        res.status(200).json({
            message: "Offer accepted successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// export const rejectOffer = async (req, res) => {
//     try {
//         const offer = await Offer.findById(req.params.id)


//         if (!offer) {
//             return res.status(404).json({ message: "Offer not found" })
//         }

//         offer.status = "Rejected"
//         await offer.save()
//         res.status(200).json({ message: "Offer Rejected" })
//     } catch (error) {
//         res.status(400).json({ message: error.message })
//     }
// }
export const rejectOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);

        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }

        // If already rejected
        if (offer.status === "Rejected") {
            return res.status(400).json({
                message: "Offer already rejected",
            });
        }

        // If already accepted
        if (offer.status === "Accepted") {
            return res.status(400).json({
                message: "Offer already accepted. Cannot reject now.",
            });
        }

        // If expired
        if (new Date() > offer.validTill) {
            offer.status = "Expired";
            await offer.save();
            return res.status(400).json({
                message: "Offer expired",
            });
        }

        // Only Pending can be rejected
        if (offer.status !== "Sent") {
            return res.status(400).json({
                message: "Invalid offer status",
            });
        }

        offer.status = "Rejected";
        await offer.save();

        const hrUser = await User.find({ role: "HR" })
        try {
            for (const hr of hrUser) {
                await sendEmail({
                    to: hr.email,
                    subject: "Offer Response Update",
                    html: `
      <p>Candidate has ${offer.status.toLowerCase()} the offer.</p>
      <p>Application ID: ${offer.application}</p>
    `,
                })
            }

        } catch (error) {
            console.log("Email failed:", err.message);

        }
        res.status(200).json({
            message: "Offer rejected successfully",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getAllOffers = async (req, res) => {
    try {
        const offer = await Offer.find().populate({
            path: "application",
            populate: {
                path: "job",
                select: "title location"
            }
        }).sort({ createdAt: -1 })

        res.status(200).json({ offer, message: "Fetched Offers" })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}


export const getMyOffers = async (req, res) => {
    try {
        const userId = req.user.id; // from auth middleware

        const offers = await Offer.find()
            .populate({
                path: "application",
                match: { candidate: userId }, // only this candidate
                populate: {
                    path: "job",
                    select: "title location salary"
                }
            })
            .sort({ createdAt: -1 });

        // Remove offers where application didn't match
        const filteredOffers = offers.filter(
            (offer) => offer.application !== null
        );

        res.status(200).json({
            message: "My offers fetched successfully",
            offers: filteredOffers,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
