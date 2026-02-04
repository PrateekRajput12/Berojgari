import Job from "../models/job.model.js";
import { generateJobCode } from "../utils/generateJobCode.js";
import mongoose from "mongoose";


export const createJob = async (req, res) => {
    try {
        const { title,
            description,
            requirements,
            location,
            shift,
            employmentType,
            expiryDate, }
            = req.body

        if (
            !title || !description || !requirements || !location || !shift || !employmentType || !expiryDate) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const jobCode = await generateJobCode()

        const job = await Job.create({
            jobCode,
            title,
            description,
            requirements,
            location,
            shift,
            employmentType,
            expiryDate,
            postedBy: req.user._id,
        });

        res.status(201).json({
            message: "Job created successfully",
            job,
        });
    } catch (error) {
        console.log(error.message || "Error in creating Job ")
        res.status(400).json({ message: "Problem in Creating JOb" })

    }
}




export const getAllJob = async (req, res) => {
    try {
        const { status, location, title } = req.query

        let query = {}
        if (status) query.status = status
        if (location) query.location = location
        if (title) query.title = { $regex: title, $option: "i" }

        const jobs = await Job.find(query).sort({ createdAt: -1 })
        if (!jobs) {
            console.log(error.message || "Error in No Jobs FOund ")
            res.status(400).json({ message: "Problem in No JObs Found" })

        }

        res.status(200).json({ message: "Jobs Found", jobs })
    } catch (error) {
        console.log(error.message || "Error in Finding Job ")
        res.status(400).json({ message: "Problem in Finding JOb" })

    }
}


export const getJobById = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) {
            console.log(error.message || "Please enter valid job id ")
            res.status(400).json({ message: "Problem enter valid job id " })
        }

        const job = await Job.findById(id)
        if (!job) {
            console.log(error.message || "No job found ")
            res.status(400).json({ message: "Problem in finding  JOb" })
        }

        res.status(200).json({ message: "Job FOund", job })
    } catch (error) {
        console.log(error.message || "Error in finding Job By Id")
        res.status(400).json({ message: "Problem in finding JOb by id" })

    }
}


export const updateJob = async (req, res) => {
    try {
        const id = req.params.id

        if (!id) {
            console.log(error.message || "Please enter valid job id ")
            res.status(400).json({ message: "Problem enter valid job id " })
        }
        const updateJob = await Job.findById(id)

        if (!updateJob) {
            console.log(error.message || "Please enter valid job id Job Not found ")
            res.status(400).json({ message: "Problem enter valid job id Job not found " })
        }

        Object.assign(updateJob, req.body)
        await updateJob.save()


        res.status(200).json({ message: "Job updated succcessfully", updateJob })
    } catch (error) {
        console.log(error.message || "Error in updating Job ")
        res.status(400).json({ message: "Problem in Updating JOb" })

    }
}


// const deleteJob = async (req, res) => {
//     try {
//         const id = req.params.id
//         if (!id) {
//             console.log(error.message || "Please enter valid job id ")
//             res.status(400).json({ message: "Problem enter valid job id " })
//         }

//         const deletedJob = await Job.findByIdAndDelete(id)
//         res.status(200).json({ message: "Job deleted successfully", deletedJob })
//     } catch (error) {
//         console.log(error.message || "Problem in deleting job")
//         res.status(400).json({ message: "problem in deleting job" })
//     }
// }

// export const closeJob = async (req, res) => {
//     try {
//         console.log("here")
//         const id = req.params.id


//         const job = await Job.findById(id)
//         console.log(job)
//         if (!job) {
//             console.log(error.message || "Please enter valid job id Job not found ")
//             res.status(400).json({ message: "Problem enter valid job id job not found" })
//         }

//         job.status = "Closed"
//         await job.save()

//         res.status(200).json({ message: "Job closed successfully" });
//     } catch (error) {
//         console.log(error.message || "Please in closing job ")
//         res.status(400).json({ message: "Problem in closing job " })
//     }

// }
// export const closeJob = async (req, res) => {
//     try {
//         const job = await Job.findById(req.params.id);

//         if (!job) {
//             return res.status(404).json({ message: "Job not found" });
//         }

//         job.status = "Closed";
//         await job.save();

//         res.status(200).json({ message: "Job closed successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

export const closeJob = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID",
            });
        }

        const job = await Job.findById(id);

        // ✅ Job not found
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // ✅ Already closed check
        if (job.status === "Closed") {
            return res.status(400).json({
                success: false,
                message: "Job is already closed",
            });
        }

        // ✅ Close job
        job.status = "Closed";
        await job.save();

        return res.status(200).json({
            success: true,
            message: "Job closed successfully",
            jobId: job.jobId,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

