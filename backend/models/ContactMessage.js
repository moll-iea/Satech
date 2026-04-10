const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true,
        trim: true
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    message: {
        type: String,
        required: [true, 'Please provide your message'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'messages'
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
