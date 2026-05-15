const express = require('express');
const router = express.Router();
const {
    getExhibitions,
    createExhibition,
    updateExhibition,
    deleteExhibition
} = require('../controllers/exhibitionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getExhibitions);
router.post('/', protect, authorize('admin'), createExhibition);
router.put('/:id', protect, authorize('admin'), updateExhibition);
router.delete('/:id', protect, authorize('admin'), deleteExhibition);

module.exports = router;