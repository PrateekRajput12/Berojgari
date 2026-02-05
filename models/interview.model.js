import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
    {
        application: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            required: true,
        },

        round: {
            type: Number,
            required: true, // 1 to 4
        },

        interviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        scheduledAt: {
            type: Date,
            required: true,
        },

        mode: {
            type: String,
            enum: ["Online", "Offline"],
            required: true,
        },

        feedback: {
            comments: String,
            score: Number,
        },

        result: {
            type: String,
            enum: ["Pending", "Pass", "Fail"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
