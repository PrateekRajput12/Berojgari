import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import sendEmail from "../utils/sendEmail.js";
// export const applyForJob = async (req, res) => {
//     try {
//         const { jobId } = req.params
//         const { name, email, phone } = req.body
//         console.log("job id ", jobId)
//         if (!name || !email || !phone || !jobId) {
//             return res.status(400).json({ message: "All fields are required" });
//         }

//         if (!req.file) {
//             if (!name || !email || !phone || !jobId) {
//                 return res.status(400).json({ message: "Resume is required" });
//             }
//         }
//         console.log("here")
//         if (!mongoose.Types.ObjectId.isValid(jobId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid Job ID",
//             });
//         }

//         const job = await Job.findById(jobId);

//         // const job = await Job.findById(jobId)
//         // console.log("real hob", job)
//         if (!job || job.status === "Closed") {
//             return res.status(400).json({ message: "Invalid or closed job" });
//         }

//         const result = await cloudinary.uploader.upload_stream({
//             folder: 'resumes', resource_type: 'raw'
//         },

//             async (error, uploadResult) => {
//                 if (error) {
//                     return res.status(500).json({ message: "Upload failed" });

//                 }

//                 const application = await Application.create({
//                     job: jobId,
//                     candidate: { name, email, phone },
//                     resume: {
//                         url: uploadResult.secure_url,
//                         publicId: uploadResult.public_id
//                     }
//                 })
//                 console.log("application", application)

//                 console.log('result', result)
//                 res.status(200).json({
//                     message: "Application submitted successfully",
//                     application
//                 })
//             })
//         result.end(req.file.bufferr)
//     } catch (error) {
//         console.log(error.message || "Error in applying job")
//         res.status(400).json({ message: error.message })
//     }
// }
// export const applyForJob = async (req, res) => {
//     try {
//         const { jobId } = req.params;
//         const { name, email, phone } = req.body;

//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Resume is required",
//             });
//         }

//         const uploadStream = cloudinary.uploader.upload_stream(
//             {
//                 folder: "resumes",
//                 resource_type: "raw",
//             },
//             async (error, uploadResult) => {
//                 if (error) {
//                     return res.status(500).json({
//                         success: false,
//                         message: "Resume upload failed",
//                     });
//                 }

//                 const application = await Application.create({
//                     job: jobId,
//                     candidate: { name, email, phone },
//                     resume: {
//                         url: uploadResult.secure_url,
//                         publicId: uploadResult.public_id,
//                     },
//                 });

//                 return res.status(201).json({
//                     success: true,
//                     message: "Application submitted successfully",
//                     application,
//                 });
//             }
//         );

//         // 🔥 THIS LINE IS MANDATORY
//         uploadStream.end(req.file.buffer);

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

export const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { name, email, phone } = req.body;

        // ✅ 1. Check job exists & open
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        if (job.status === "Closed") {
            return res.status(400).json({
                success: false,
                message: "Job is closed. Applications not allowed.",
            });
        }

        // ✅ 2. CHECK DUPLICATE APPLICATION
        const alreadyApplied = await Application.findOne({
            job: jobId,
            "candidate.email": email,
        });

        if (alreadyApplied) {
            return res.status(409).json({
                success: false,
                message: "You have already applied for this job",
            });
        }

        // ✅ 3. Resume required
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume is required",
            });
        }

        // ✅ 4. Upload resume to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "resumes",
                resource_type: "raw",
            },
            async (error, uploadResult) => {
                if (error) {
                    return res.status(500).json({
                        success: false,
                        message: "Resume upload failed",
                    });
                }

                console.log("before appication")
                // ✅ 5. Save application
                const application = await Application.create({
                    job: jobId,
                    candidate: { name, email, phone },
                    resume: {
                        url: uploadResult.secure_url,
                        publicId: uploadResult.public_id,
                    },
                });
                try {
                    await sendEmail({
                        to: email,
                        subject: "Application Received",
                        html: `
                    <p>Hi ${name},</p>
    <p>Your application has been successfully submitted.</p>
    <p>We will contact you if shortlisted.</p>
    <br/>
    <p>Regards,<br/>HR Team</p>`
                    })
                } catch (error) {
                    console.log("Email failed:", err.message);

                }
                return res.status(201).json({
                    success: true,
                    message: "Application submitted successfully",
                    application,
                });
            }
        );


        // 🔥 mandatory
        uploadStream.end(req.file.buffer);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const getApplicationsByJob = async (req, res) => {
    try {
        const application = await Application.find({
            job: req.params.jobId
        }).sort({ createdAt: -1 })
        res.status(200).json({ message: "Applications fetched", application });
    } catch (error) {
        console.log(error.message || "Error in fetching applications")
        res.status(400).json({ message: error.message })
    }
}



export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body

        const application = await Application.findById(req.params.id)
        if (!application) {
            return res.status(400).json({ message: "Application not found" })
        }

        application.status = status
        await application.save()

        res.status(200).json({ message: "Application status updated", application })
    } catch (error) {
        console.log(error.message || "Error in updating application status")
        res.status(400).json({ message: error.message })
    }
}