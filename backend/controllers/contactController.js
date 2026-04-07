const ContactMessage = require('../models/ContactMessage');
const { sendContactEmail } = require('../config/mailer');

exports.createContactMessage = async (req, res) => {
    try {
        const { name, email, company = '', message } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required.'
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Enter a valid email.'
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required.'
            });
        }

        const savedMessage = await ContactMessage.create({
            name: name.trim(),
            email: email.trim(),
            company: company.trim(),
            message: message.trim()
        });

        await sendContactEmail({
            name: savedMessage.name,
            email: savedMessage.email,
            company: savedMessage.company,
            message: savedMessage.message,
            createdAt: savedMessage.createdAt
        });

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully.',
            data: {
                id: savedMessage._id,
                createdAt: savedMessage.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Message saved but email delivery failed. Please check server email configuration.',
            error: error.message
        });
    }
};
