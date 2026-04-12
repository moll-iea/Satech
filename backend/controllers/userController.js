const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendAdminVerificationEmail } = require('../config/mailer');

const normalizeEmail = (email) => email.trim().toLowerCase();

const buildVerificationToken = () => crypto.randomBytes(32).toString('hex');

const hashVerificationToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createPendingAdminAccount = async ({ name, email, password, verificationUrlBase }) => {
    const existingUser = await User.findOne({ email: normalizeEmail(email) });
    if (existingUser) {
        const error = new Error('User with this email already exists.');
        error.statusCode = 400;
        throw error;
    }

    const admin = await User.create({
        name: name.trim(),
        email: normalizeEmail(email),
        password,
        role: 'admin',
        isEmailVerified: false
    });

    const verificationToken = buildVerificationToken();
    admin.emailVerificationToken = hashVerificationToken(verificationToken);
    admin.emailVerificationExpires = Date.now() + 1000 * 60 * 60 * 24;
    await admin.save({ validateBeforeSave: false });

    const verificationUrl = `${verificationUrlBase}/api/users/admin/verify-email?token=${verificationToken}`;

    try {
        await sendAdminVerificationEmail({
            name: admin.name,
            email: admin.email,
            verificationUrl
        });
    } catch (error) {
        await User.findByIdAndDelete(admin._id);
        const sendError = new Error(error.message || 'Failed to send verification email.');
        sendError.statusCode = 500;
        throw sendError;
    }

    return admin;
};

const getSignedToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

        if (!user || user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials.'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before signing in.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials.'
            });
        }

        const token = getSignedToken(user);

        return res.status(200).json({
            success: true,
            message: 'Admin login successful.',
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error logging in admin',
            error: error.message
        });
    }
};

exports.getAdminSetupStatus = async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });

        return res.status(200).json({
            success: true,
            data: {
                hasAdmin: adminCount > 0
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking admin setup status',
            error: error.message
        });
    }
};

exports.verifyAdminEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).send('Verification token is required.');
        }

        const hashedToken = hashVerificationToken(token);
        const admin = await User.findOne({
            role: 'admin',
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).send('Verification link is invalid or has expired.');
        }

        admin.isEmailVerified = true;
        admin.emailVerifiedAt = new Date();
        admin.emailVerificationToken = undefined;
        admin.emailVerificationExpires = undefined;
        await admin.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/admin/login?verified=1`);
    } catch (error) {
        return res.status(500).send('Error verifying admin email.');
    }
};

exports.getAdminProfile = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching admin profile',
            error: error.message
        });
    }
};

exports.bootstrapAdmin = async (req, res) => {
    try {
        const setupKey = req.headers['x-admin-setup-key'];
        const expectedKey = process.env.ADMIN_SETUP_KEY;
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists. Use admin login.'
            });
        }

        if (expectedKey && setupKey && setupKey !== expectedKey) {
            return res.status(403).json({
                success: false,
                message: 'Invalid setup key.'
            });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.'
            });
        }

        const verificationBaseUrl = `${req.protocol}://${req.get('host')}`;
        const admin = await createPendingAdminAccount({
            name,
            email,
            password,
            verificationUrlBase: verificationBaseUrl
        });

        return res.status(201).json({
            success: true,
            message: 'Admin account created successfully.',
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 500 ? 'Error creating admin account' : error.message,
            error: error.message
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};
