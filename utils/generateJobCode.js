import Job from "../models/job.model.js";

export const generateJobCode = async () => {
    const count = await Job.countDocuments();
    const year = new Date().getFullYear();
    return `JOB-${year}-${String(count + 1).padStart(3, "0")}`;
};
