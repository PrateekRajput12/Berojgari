import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        candidate: {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
            },
            phone: {
                type: String,
                required: true,
            },
        },

        resume: {
            url: {
                type: String,
                required: true,
            },
            publicId: {
                type: String,
                required: true,
            },
        },

        status: {
            type: String,
            enum: ["Applied", "Screened", "Shortlisted", "Rejected", "Selected", "Hired"],
            default: "Applied",
        },

        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);



const Application = mongoose.model("Application", applicationSchema);
export default Application;
