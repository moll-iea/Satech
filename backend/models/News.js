const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '#',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  imageUrl: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('News', newsSchema);