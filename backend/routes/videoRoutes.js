const express = require('express');
const router = express.Router();
const {
    getVideos,
    createVideo,
    updateVideo,
    deleteVideo
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getVideos);
router.post('/', protect, authorize('admin'), upload.single('thumbnail'), createVideo);
router.put('/:id', protect, authorize('admin'), upload.single('thumbnail'), updateVideo);
router.delete('/:id', protect, authorize('admin'), deleteVideo);

module.exports = router;