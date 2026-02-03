import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        applicationId: {
            type: String,
            unique: true
        },

        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resume: {
            url: String,
            originalName: String
        },

        source: {
            type: String,
            enum: ["Website", "Referral", "LinkedIn", "Naukri", "Indeed"],
            default: "Website"
        },

        status: {
            type: String,
            enum: [
                "APPLIED",
                "SHORTLISTED",
                "REJECTED",
                "INTERVIEW",
                "OFFERED",
                "HIRED"
            ],
            default: "APPLIED"
        },

        screening: {
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            notes: String,
            score: Number
        },

        history: [
            {
                status: String,
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                changedAt: {
                    type: Date,
                    default: Date.now
                },
                reason: String
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
