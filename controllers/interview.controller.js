import Interview from "../models/interview.model.js";
import Application from "../models/application.model.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.model.js";
// export const scheduleInterview = async (req, res) => {
//     try {
//         const { applicationId, round, interviewerId, scheduledAt, mode } = req.body
//         if (!applicationId || !round || !interviewerId || !scheduledAt || !mode) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         if (round < 1 || round > 4) {
//             return res.status(400).json({ message: "invalid Interview round" })
//         }

//         const application = await Application.findById(applicationId);
//         if (!application) {
//             return res.status(404).json({ message: "Application not found" });
//         }

//         if (application.status === "Rejected") {
//             return res.status(400).json({ message: "Candidate already rejected" });
//         }

//         // prevent skipping rounds
//         const previousRound = await Interview.findOne({
//             application: applicationId,
//             round: round - 1,
//             result: "Pass",
//         });
//         if (round > 1 && !previousRound) {
//             return res.status(400).json({
//                 message: "Previous round not cleared",
//             });
//         }
//         const interview = await Interview.create({
//             application: applicationId,
//             round,
//             interviewer: interviewerId,
//             scheduledAt,
//             mode,
//         });

//         res.status(201).json({
//             message: "Interview scheduled",
//             interview,
//         });
//     } catch (error) {
//         console.log(error.message || "Error in scheduling interview")
//         res.status(500).json({ message: error.message });

//     }
// }
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
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (application.status === "Rejected") {
            return res.status(400).json({ message: "Candidate already rejected" });
        }

        // ✅ NEW: Prevent scheduling same round twice
        const existingInterview = await Interview.findOne({
            application: applicationId,
            round: round,
        });

        if (existingInterview) {
            return res.status(400).json({
                message: `Interview already scheduled for round ${round}`,
            });
        }

        // Prevent skipping rounds
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
        const interviewer = await User.findById(interviewerId)
        try {
            await sendEmail({
                to: application.candidate.email,
                subject: `Interview Round ${round} Scheduled`,
                html: `
              <p>Hi ${application.candidate.name},</p>
    <p>Your interview round ${round} has been scheduled.</p>
    <p><b>Date:</b> ${new Date(scheduledAt).toLocaleString()}</p>
    <p><b>Mode:</b> ${mode}</p>
            `
            })
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
            console.log("Email failed:", err.message);

        }

        res.status(201).json({
            message: "Interview scheduled",
            interview,
        });

    } catch (error) {
        console.log(error.message || "Error in scheduling interview");
        res.status(500).json({ message: error.message });
    }
};



// export const submitInterviewFeedback = async (req, res) => {
//     try {
//         const { comment, score, result } = req.body

//         const interview = await Interview.findById(req.params.id);
//         if (!interview) {
//             return res.status(404).json({ message: "Interview not found" });
//         }
//         if (!interview) {
//             return res.status(404).json({ message: "Interview not found" });
//         }
//         interview.feedback = { comment, score };
//         interview.result = result;
//         await interview.save();

//         const application = await Application.findById(interview.application);
//         if (result === "Fail") {
//             application.status = "Rejected";
//             await application.save();
//         }

//         if (result === "Fail") {
//             application.status = "Rejected";
//             await application.save();
//         }
//         try {
//             if (result === "Fail") {
//                 await sendEmail({
//                     to: application.candidate.email,
//                     subject: "Interview Update",
//                     html: `
//                  <p>Hi ${application.candidate.name},</p>
//       <p>Thank you for attending.</p>
//       <p>You were not selected at this stage.</p>
//                 `
//                 })
//             } if (result === "Pass" && interview.round < 4) {
//                 await sendEmail({
//                     to: application.candidate.email,
//                     subject: "Interview Cleared",
//                     html: `
//       <p>Congratulations ${application.candidate.name}!</p>
//       <p>You cleared Round ${interview.round}.</p>
//       <p>Next round details will follow.</p>
//     `,
//                 });
//             }

//             if (result === "Pass" && interview.round === 4) {
//                 await sendEmail({
//                     to: application.candidate.email,
//                     subject: "Interview Process Completed",
//                     html: `
//       <p>Congratulations!</p>
//       <p>You have cleared all rounds.</p>
//       <p>HR will contact you with offer details.</p>
//     `,
//                 });
//             }
//         } catch (error) {
//             console.log("Email failed:", err.message);

//         }

//         res.status(200).json({
//             message: "Feedback submitted",
//             interview,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }
export const submitInterviewFeedback = async (req, res) => {
    try {
        const { comment, score, result } = req.body;

        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ message: "Interview not found" });
        }

        // Save feedback
        interview.feedback = { comment, score };
        interview.result = result;
        await interview.save();

        // Get application with candidate populated
        const application = await Application.findById(interview.application)
            .populate("candidate");

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // If candidate failed
        if (result === "Fail") {
            application.status = "Rejected";
            await application.save();

            await sendEmail({
                to: application.candidate.email,
                subject: "Interview Update",
                html: `
          <p>Hi ${application.candidate.name},</p>
          <p>Thank you for attending the interview.</p>
          <p>You were not selected at this stage.</p>
        `,
            });
        }

        // If candidate passed but not final round
        if (result === "Pass" && interview.round < 4) {
            await sendEmail({
                to: application.candidate.email,
                subject: "Interview Cleared",
                html: `
          <p>Congratulations ${application.candidate.name}!</p>
          <p>You cleared Round ${interview.round}.</p>
          <p>Next round details will follow soon.</p>
        `,
            });
        }

        // If final round cleared
        if (result === "Pass" && interview.round === 4) {
            application.status = "Selected";
            await application.save();

            await sendEmail({
                to: application.candidate.email,
                subject: "Interview Process Completed",
                html: `
          <p>Congratulations ${application.candidate.name}!</p>
          <p>You have cleared all rounds.</p>
          <p>HR will contact you with offer details soon.</p>
        `,
            });
        }

        res.status(200).json({
            message: "Feedback submitted successfully",
            interview,
        });

    } catch (error) {
        console.log("Submit Feedback Error:", error.message);
        res.status(500).json({ message: error.message });
    }
};

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

export const getMyInterviews = async (req, res) => {
    const interviews = await Interview.find({
        interviewer: req.user._id,
    })
        .populate({
            path: "application",
            populate: {
                path: "candidate",
                select: "name email",
            },
        });

    res.json({ interviews });
};
