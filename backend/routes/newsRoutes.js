const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const upload = require('../middleware/uploadHandler');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Admin routes (no auth required per your choice)
router.post('/', upload.single('image'), newsController.createNews);
router.put('/:id', upload.single('image'), newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;