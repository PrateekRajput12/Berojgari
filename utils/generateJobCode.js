import Job from "../models/job.model.js";

export const generateJobCode = async () => {
    const count = await Job.countDocuments();
    const year = new Date().getFullYear();
    return `${String(count + 1).padStart(3, "0")}-JOB-${year}`;
};

// export const generateJobCode = async () => {
//     const year = new Date().getFullYear();

//     // Find last job of this year
//     const lastJob = await Job.findOne({
//         jobId: { $regex: `^JOB-${year}-` },
//     })
//         .sort({ createdAt: -1 })
//         .select("jobId");

//     let nextNumber = 1;

//     if (lastJob?.jobId) {
//         const lastNumber = parseInt(lastJob.jobId.split("-")[2], 10);
//         nextNumber = lastNumber + 1;
//     }

//     return `JOB-${year}-${String(nextNumber).padStart(3, "0")}`;
// };

