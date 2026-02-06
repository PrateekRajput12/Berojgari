import Application from "../models/application.model.js";
import Offer from "../models/Offer.model.js";

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
        if (offer.status !== "Pending") {
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
        if (offer.status !== "Pending") {
            return res.status(400).json({
                message: "Invalid offer status",
            });
        }

        offer.status = "Rejected";
        await offer.save();

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