import Interview from "../models/interview.model.js";
import Application from "../models/application.model.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.model.js";

export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, round, interviewerId, scheduledAt, mode } = req.body;

        if (!applicationId || !round || !interviewerId || !scheduledAt || !mode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (round < 1 || round > 4) {
            return res.status(400).json({ message: "Invalid interview round" });
        }

        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ message: "Application not found" });

        if (application.status === "Rejected") {
            return res.status(400).json({ message: "Candidate already rejected" });
        }

        // ✅ Prevent scheduling same round twice
        const existingInterview = await Interview.findOne({ application: applicationId, round });
        if (existingInterview) {
            return res.status(400).json({ message: `Interview already scheduled for round ${round}` });
        }

        // ✅ Prevent skipping rounds
        const previousRound = await Interview.findOne({
            application: applicationId,
            round: round - 1,
            result: "Pass",
        });

        if (round > 1 && !previousRound) {
            return res.status(400).json({ message: "Previous round not cleared" });
        }

        // ✅ verify interviewer exists
        const interviewer = await User.findById(interviewerId);
        if (!interviewer) return res.status(404).json({ message: "Interviewer not found" });

        const interview = await Interview.create({
            application: applicationId,
            round,
            interviewer: interviewerId,
            scheduledAt,
            mode,
        });

        // ✅ Emails (don’t fail the API if email fails)
        try {
            await sendEmail({
                to: application.candidate.email,
                subject: `Interview Round ${round} Scheduled`,
                html: `
          <p>Hi ${application.candidate.name},</p>
          <p>Your interview round ${round} has been scheduled.</p>
          <p><b>Date:</b> ${new Date(scheduledAt).toLocaleString()}</p>
          <p><b>Mode:</b> ${mode}</p>
        `,
            });

            await sendEmail({
                to: interviewer.email,
                subject: `Interview Assigned (Round ${round})`,
                html: `
          <p>You have been assigned an interview.</p>
          <p><b>Candidate:</b> ${application.candidate.name}</p>
          <p><b>Date:</b> ${new Date(scheduledAt).toLocaleString()}</p>
        `,
            });
        } catch (error) {
            console.log("Email failed:", error.message);
        }

        return res.status(201).json({
            message: "Interview scheduled",
            interview,
        });
    } catch (error) {
        console.log(error.message || "Error in scheduling interview");
        return res.status(500).json({ message: error.message });
    }
};

export const submitInterviewFeedback = async (req, res) => {
    try {
        const { comment, score, result } = req.body;

        // ✅ validate result
        if (!["Pass", "Fail"].includes(result)) {
            return res.status(400).json({ message: "Result must be Pass or Fail" });
        }

        const interview = await Interview.findById(req.params.id);
        if (!interview) return res.status(404).json({ message: "Interview not found" });

        // ✅ Only assigned interviewer can submit
        if (String(interview.interviewer) !== String(req.user._id)) {
            return res.status(403).json({ message: "You are not assigned to this interview" });
        }

        // ✅ Prevent submitting feedback twice
        if (interview.result !== "Pending") {
            return res.status(400).json({ message: "Feedback already submitted" });
        }

        interview.feedback = { comments: comment, score };
        interview.result = result;
        await interview.save();

        // ✅ Application candidate is EMBEDDED (no populate)
        const application = await Application.findById(interview.application);
        if (!application) return res.status(404).json({ message: "Application not found" });

        // ❌ Fail
        if (result === "Fail") {
            application.status = "Rejected";
            await application.save();

            try {
                await sendEmail({
                    to: application.candidate.email,
                    subject: "Interview Update",
                    html: `
            <p>Hi ${application.candidate.name},</p>
            <p>Thank you for attending the interview.</p>
            <p>You were not selected at this stage.</p>
          `,
                });
            } catch (error) {
                console.log("Email failed:", error.message);
            }
        }

        // ✅ Pass Round 1-3
        if (result === "Pass" && interview.round < 4) {
            try {
                await sendEmail({
                    to: application.candidate.email,
                    subject: "Interview Cleared",
                    html: `
            <p>Congratulations ${application.candidate.name}!</p>
            <p>You cleared Round ${interview.round}.</p>
            <p>Next round details will follow soon.</p>
          `,
                });
            } catch (error) {
                console.log("Email failed:", error.message);
            }
        }

        // ✅ Final Pass Round 4
        if (result === "Pass" && interview.round === 4) {
            application.status = "Selected";
            await application.save();

            try {
                await sendEmail({
                    to: application.candidate.email,
                    subject: "Interview Process Completed",
                    html: `
            <p>Congratulations ${application.candidate.name}!</p>
            <p>You have cleared all rounds.</p>
            <p>HR will contact you with offer details soon.</p>
          `,
                });
            } catch (error) {
                console.log("Email failed:", error.message);
            }
        }

        return res.status(200).json({
            message: "Feedback submitted successfully",
            interview,
        });
    } catch (error) {
        console.log("Submit Feedback Error:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export const getInterviewsByApplication = async (req, res) => {
    try {
        const interviews = await Interview.find({ application: req.params.applicationId })
            .populate("interviewer", "name email")
            .sort({ round: 1 });

        return res.status(200).json({ interviews });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// export const getMyInterviews = async (req, res) => {
//     try {
//         const interviews = await Interview.find({ interviewer: req.user._id })
//             .populate("application") // ✅ includes embedded candidate automatically
//             .sort({ scheduledAt: 1 });

//         return res.status(200).json({ interviews });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };
export const getMyInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find({ interviewer: req.user._id })
            .populate("application") // ✅ candidate is embedded inside application
            .sort({ scheduledAt: -1 });

        return res.status(200).json({ interviews });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getCandidateInterviews = async (req, res) => {
    try {
        // 1) find candidate's applications by email (because candidate is embedded)
        const apps = await Application.find({ "candidate.email": req.user.email }).select("_id job candidate");

        const applicationIds = apps.map((a) => a._id);

        // 2) fetch all interviews for those applications
        const interviews = await Interview.find({ application: { $in: applicationIds } })
            .populate({
                path: "application",
                select: "candidate job status",
                populate: {
                    path: "job",
                    select: "title location",
                },
            })
            .populate("interviewer", "name email")
            .sort({ scheduledAt: -1 });

        return res.status(200).json({ interviews });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
