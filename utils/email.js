// utils/email.js
const { Resend } = require('resend');   // <-- FIXED import
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports.sendEmail = async ({ to, subject, text }) => {
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev', // or your custom verified domain
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
