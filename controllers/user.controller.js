// controllers/user.controller.js
import User from "../models/user.model.js";

export const getInterviewers = async (req, res) => {
    try {
        const users = await User.find({ role: "Interviewer" })
            .select("_id name email")
            .sort({ name: 1 });

        return res.status(200).json({
            message: "Interviewers fetched successfully",
            users,
        });
    } catch (error) {
        console.log("Get interviewers error:", error.message);
        return res.status(500).json({
            message: "Failed to fetch interviewers",
        });
    }
};
