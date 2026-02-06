import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, text,html }) => {
    try {
        await transporter.sendMail({
            from: "Inngest AI Ticket Assistant",
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.log("Error sending email:", error);
    }
};