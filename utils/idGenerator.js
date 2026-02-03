export const generateJobId = async (JobModel) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const prefix = `JP-${year}-${month}`;

    const lastJob = await JobModel.findOne({
        jobId: { $regex: `^${prefix}` }
    }).sort({ createdAt: -1 });

    let count = 1;

    if (lastJob) {
        const lastNumber = parseInt(lastJob.jobId.split("-")[3]);
        count = lastNumber + 1;
    }

    return `${prefix}-${String(count).padStart(4, "0")}`;
};
