import nodemailer from "nodemailer";
interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: '"Pet Backend 🐾" <noreply@pet.com>',
            to,
            subject,
            text,
            html,
        }).then((info) => console.log(info)).catch((err) => console.log(err));

    } catch (error) {
        throw error;
    }
}
