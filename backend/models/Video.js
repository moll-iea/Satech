const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a video title'],
        trim: true
    },
    url: {
        type: String,
        required: [true, 'Please provide a video URL'],
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    thumbnail: {
        type: String,
        default: '',
        trim: true
    },
    thumbnailPublicId: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'videos'
});

videoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Video', videoSchema);