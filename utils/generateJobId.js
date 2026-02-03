import Job from "../models/Job.js";

const generateJobId = async () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    const lastJob = await Job.findOne({
        jobId: { $regex: `JP-${year}-${month}` }
    }).sort({ createdAt: -1 });

    let count = 1;

    if (lastJob) {
        count = parseInt(lastJob.jobId.split("-")[3]) + 1;
    }

    return `JP-${year}-${month}-${String(count).padStart(4, "0")}`;
};

export default generateJobId;
