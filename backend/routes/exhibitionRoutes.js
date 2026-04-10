const express = require('express');
const router = express.Router();
const {
    getExhibitions,
    createExhibition,
    updateExhibition,
    deleteExhibition
} = require('../controllers/exhibitionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getExhibitions);
router.post('/', protect, authorize('admin'), upload.single('image'), createExhibition);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateExhibition);
router.delete('/:id', protect, authorize('admin'), deleteExhibition);

module.exports = router;