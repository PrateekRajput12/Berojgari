import Application from "../models/application.js";
import generateApplicationId from "../utils/generateApplicationId.js";
import Job from "../models/Job.js";

export const applyJob = async (req, res) => {
    console.log("herere")
    try {
        const job = await Job.findById(req.params.jobId);

        if (!job || job.status !== "OPEN") {
            return res.status(400).json({
                success: false,
                message: "Job not available"
            });
        }

        const existing = await Application.findOne({
            job: job._id,
            candidate: req.user._id
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Already applied"
            });
        }

        const applicationId = await generateApplicationId();
        console.log("erere")
        const application = await Application.create({
            applicationId,
            job: job._id,
            candidate: req.user._id,
            resume: {
                url: req.file.path,
                originalName: req.file.originalname
            },
            history: [
                {
                    status: "APPLIED",
                    changedBy: req.user._id
                }
            ]
        });

        job.metrics.applications += 1;
        await job.save();

        res.status(201).json({
            success: true,
            application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
