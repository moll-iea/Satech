const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide an exhibition name'],
        trim: true
    },
    link: {
        type: String,
        required: [true, 'Please provide an exhibition link'],
        trim: true
    },
    imageUrl: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
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
    collection: 'exhibitions'
});

exhibitionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Exhibition', exhibitionSchema);