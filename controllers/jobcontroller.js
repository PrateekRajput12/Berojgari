import Job from "../models/Job.js";
// import { generateJobId } from "../utils/idGenerator.js";

// import Job from "../models/job.model.js";
import generateJobId from "../utils/generateJobId.js";

export const createJob = async (req, res) => {
    try {
        const jobId = await generateJobId();

        const job = await Job.create({
            ...req.body,
            jobId,
            postedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const getAllJobs = async (req, res) => {
    try {
        const { role, zone, skill, status } = req.query;

        let filter = {};

        if (status) filter.status = status;
        if (zone) filter.hiringZone = zone;
        if (skill) filter.skills = { $in: [skill] };

        const jobs = await Job.find(filter).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const expireJobs = async () => {
    await Job.updateMany(
        {
            expiryDate: { $lt: new Date() },
            status: "OPEN"
        },
        {
            $set: { status: "EXPIRED" }
        }
    );
};

// export const getAllJobs = async (req, res) => {
//     try {
//         // Fetch all jobs
//         console.log("here")
//         const jobs = await Job.find().sort({ createdAt: -1 }); // latest first

//         res.status(200).json({
//             success: true,
//             count: jobs.length,
//             jobs
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };
