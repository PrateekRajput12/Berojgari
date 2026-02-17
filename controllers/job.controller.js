import Job from "../models/job.model.js";
import mongoose from "mongoose";
import { generateJobCode } from "../utils/generateJobCode.js";

// ✅ Create Job (HR)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      shift,
      employmentType,
      expiryDate,
    } = req.body;

    if (!title || !description || !requirements || !location || !shift || !employmentType || !expiryDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const jobCode = await generateJobCode();

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

    return res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    console.log("Create job error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Jobs (Public)
export const getAllJob = async (req, res) => {
  try {
    const { status, location, title } = req.query;

    const query = {};
    if (status) query.status = status;
    if (location) query.location = location;
    if (title) query.title = { $regex: title, $options: "i" }; // ✅ $options (not $option)

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ message: "Jobs fetched", jobs });
  } catch (error) {
    console.log("Get jobs error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get Job By ID (Public)
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job found", job });
  } catch (error) {
    console.log("Get job by id error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Update Job (HR)
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    Object.assign(job, req.body);
    await job.save();

    return res.status(200).json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.log("Update job error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Close Job (HR)
export const closeJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Job is already closed",
      });
    }

    job.status = "Closed";
    await job.save();

    return res.status(200).json({
      success: true,
      message: "Job closed successfully",
      job, // ✅ return updated job
    });
  } catch (error) {
    console.log("Close job error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
