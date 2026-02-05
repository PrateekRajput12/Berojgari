import Interview from "../models/interview.model.js";
import Application from "../models/application.model.js";

export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, round, interviewerId, scheduledAt, mode } = req.body
        if (!applicationId || !round || !interviewerId || !scheduledAt || !mode) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (round < 1 || round > 4) {
            return res.status(400).json({ message: "invalid Interview round" })
        }

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status === "Rejected") {
            return res.status(400).json({ message: "Candidate already rejected" });
        }

        // prevent skipping rounds
        const previousRound = await Interview.findOne({
            application: applicationId,
            round: round - 1,
            result: "Pass",
        });
        if (round > 1 && !previousRound) {
            return res.status(400).json({
                message: "Previous round not cleared",
            });
        }
        const interview = await Interview.create({
            application: applicationId,
            round,
            interviewer: interviewerId,
            scheduledAt,
            mode,
        });

        res.status(201).json({
            message: "Interview scheduled",
            interview,
        });
    } catch (error) {
        console.log(error.message || "Error in scheduling interview")
        res.status(500).json({ message: error.message });

    }
}


export const submitInterviewFeedback = async (req, res) => {
    try {
        const { comment, score, result } = req.body

        const interview = await Interview.findById(req.params.id);
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }
        interview.feedback = { comments, score };
        interview.result = result;
        await interview.save();

        const application = await Application.findById(interview.application);
        if (result === "Fail") {
            application.status = "Rejected";
            await application.save();
        }

        if (result === "Fail") {
            application.status = "Rejected";
            await application.save();
        }

        res.status(200).json({
            message: "Feedback submitted",
            interview,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const getInterviewsByApplication = async (req, res) => {
    try {
        const interviews = await Interview.find({
            application: req.params.applicationId,
        })
            .populate("interviewer", "name email")
            .sort({ round: 1 });

        res.status(200).json({ interviews });
    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}