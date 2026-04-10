const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide an exhibition name'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Please provide an exhibition image URL'],
        trim: true
    },
    imagePublicId: {
        type: String,
        default: ''
    },
    row: {
        type: Number,
        required: [true, 'Please specify row (1 or 2)'],
        enum: [1, 2]
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