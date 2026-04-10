const nodemailer = require('nodemailer');

const requiredEnv = ['SMTP_USER', 'SMTP_PASS', 'CONTACT_RECEIVER_EMAIL'];

const getMissingEnv = () => requiredEnv.filter((key) => !process.env[key]);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendContactEmail = async ({ name, email, company, message, createdAt }) => {
    const missing = getMissingEnv();
    if (missing.length) {
        throw new Error(`Missing email config: ${missing.join(', ')}`);
    }

    const subject = `New Contact Inquiry from ${name}`;

    const textBody = [
        'New contact form submission',
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || 'N/A'}`,
        `Date: ${new Date(createdAt).toISOString()}`,
        '',
        'Message:',
        message
    ].join('\n');

    const htmlBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Date:</strong> ${new Date(createdAt).toISOString()}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    await transporter.sendMail({
        from: `Satech Contact Form <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_RECEIVER_EMAIL,
        replyTo: email,
        subject,
        text: textBody,
        html: htmlBody
    });
};

module.exports = { sendContactEmail };
