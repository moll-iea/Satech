const express = require('express');
const router = express.Router();
const { createContactMessage, getContactMessages } = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', createContactMessage);
router.get('/messages', protect, authorize('admin'), getContactMessages);

module.exports = router;
