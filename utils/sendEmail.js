import transporter from "../config/email.js";

const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `HRMS Team <${process.env.EMAIL_USER}>`,
        to,
        subject, html
    })
}

export default sendEmail