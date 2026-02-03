import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            unique: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        requirements: {
            type: [String],
            required: true
        },

        skills: {
            type: [String]
        },

        shift: {
            type: String,
            enum: ["Day", "Night", "Rotational"]
        },

        hiringZone: {
            type: String
        },

        employmentType: {
            type: String,
            enum: ["Full-Time", "Part-Time", "Internship", "Contract"]
        },

        experience: {
            type: String
        },

        salaryRange: {
            min: Number,
            max: Number
        },

        postingChannels: {
            type: [String]
        },

        status: {
            type: String,
            enum: ["OPEN", "CLOSED", "EXPIRED"],
            default: "OPEN"
        },

        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        postedAt: {
            type: Date,
            default: Date.now
        },

        expiryDate: {
            type: Date,
            required: true
        },

        metrics: {
            views: { type: Number, default: 0 },
            applications: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
