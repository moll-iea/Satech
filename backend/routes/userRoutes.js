const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/admin/login', userController.adminLogin);
router.get('/admin/status', userController.getAdminSetupStatus);
router.post('/admin/bootstrap', userController.bootstrapAdmin);
router.post('/admin/register', protect, authorize('admin'), userController.registerAdmin);
router.get('/admin/me', protect, authorize('admin'), userController.getAdminProfile);

// User routes
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/:id', protect, authorize('admin'), userController.getUserById);
router.post('/', protect, authorize('admin'), userController.createUser);
router.put('/:id', protect, authorize('admin'), userController.updateUser);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
