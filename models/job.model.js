import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        jobCode: {
            type: String,
            required: true,
            unique: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        requirements: {
            type: [String],
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        shift: {
            type: String,
            required: true,
        },

        employmentType: {
            type: String,
            enum: ["Full-Time", "Part-Time", "Contract"],
            required: true,
        },

        status: {
            type: String,
            enum: ["Open", "Closed"],
            default: "Open",
        },

        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        expiryDate: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
