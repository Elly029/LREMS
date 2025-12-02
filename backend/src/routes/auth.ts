
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config/environment';
import { protect } from '../middleware/auth';
import cache from '../utils/cache';

const router = Router();

// Generate JWT
const generateToken = (id: string) => {
    return jwt.sign({ id }, config.jwt.secret || 'secret', {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            console.log(`Login attempt failed: User ${username} not found`);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Login attempt failed: Invalid password for user ${username}`);
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Successful login - clear cache to ensure fresh data for this user
        cache.clearAll();
        console.log(`User ${username} logged in successfully, cache cleared`);
        res.json({
            _id: user._id,
            username: user.username,
            name: user.name,
            access_rules: user.access_rules,
            access_rules_version: user.access_rules_version || 1,
            is_admin_access: user.is_admin_access,
            evaluator_id: user.evaluator_id,
            token: generateToken((user._id as unknown) as string),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', protect, async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user?._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (await bcrypt.compare(currentPassword, user.password)) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(400).json({ message: 'Invalid current password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/validate
// @desc    Validate if user session is still valid (check access_rules_version)
// @access  Private
router.post('/validate', protect, async (req: Request, res: Response) => {
    try {
        const { access_rules_version } = req.body;

        const user = await User.findById(req.user?._id).select('-password');
        if (!user) {
            return res.status(404).json({
                valid: false,
                reason: 'user_not_found',
                message: 'User not found'
            });
        }

        const currentVersion = user.access_rules_version || 1;
        const clientVersion = access_rules_version || 1;

        if (currentVersion !== clientVersion) {
            console.log(`Session invalidated for user ${user.username}: version mismatch (client: ${clientVersion}, server: ${currentVersion})`);
            return res.json({
                valid: false,
                reason: 'access_rules_changed',
                message: 'Your access permissions have been updated. Please log in again.',
                current_version: currentVersion
            });
        }

        res.json({
            valid: true,
            access_rules: user.access_rules,
            access_rules_version: currentVersion,
            is_admin_access: user.is_admin_access
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            valid: false,
            reason: 'server_error',
            message: 'Server error during validation'
        });
    }
});

// @route   POST /api/auth/create-evaluator-accounts
// @desc    Create user accounts for all evaluators (Admin only)
// @access  Private/Admin
router.post('/create-evaluator-accounts', protect, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const currentUser = await User.findById(req.user?._id);
        if (!currentUser?.is_admin_access) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const Evaluator = require('../models/Evaluator').default;
        const evaluators = await Evaluator.find();

        const defaultPassword = 'BLRLRE';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const createdAccounts = [];
        const skippedAccounts = [];
        const errors = [];

        for (const evaluator of evaluators) {
            try {
                // Create username from DepEd email (before @)
                const username = evaluator.depedEmail.split('@')[0].toLowerCase();

                // Check if account already exists
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    skippedAccounts.push({
                        evaluator: evaluator.name,
                        username,
                        reason: 'Account already exists'
                    });
                    continue;
                }

                // Create user account
                const newUser = new User({
                    username,
                    password: hashedPassword,
                    name: evaluator.name,
                    access_rules: [],
                    is_admin_access: false,
                    evaluator_id: evaluator._id.toString(),
                });

                await newUser.save();

                // Update evaluator with username
                evaluator.username = username;
                await evaluator.save();

                createdAccounts.push({
                    evaluator: evaluator.name,
                    username,
                    defaultPassword: 'BLRLRE'
                });
            } catch (error: any) {
                errors.push({
                    evaluator: evaluator.name,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Evaluator account creation completed',
            created: createdAccounts.length,
            skipped: skippedAccounts.length,
            errorCount: errors.length,
            createdAccounts,
            skippedAccounts,
            errors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/link-evaluators
// @desc    Link existing user accounts to evaluator profiles (Admin only)
// @access  Private/Admin
router.post('/link-evaluators', protect, async (req: Request, res: Response) => {
    try {
        // Check if user is admin
        const currentUser = await User.findById(req.user?._id);
        if (!currentUser?.is_admin_access) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const Evaluator = require('../models/Evaluator').default;
        const evaluators = await Evaluator.find();

        let updatedCount = 0;
        let notFoundCount = 0;
        let alreadyLinkedCount = 0;
        const updates = [];

        for (const evaluator of evaluators) {
            // Determine username from email if not set
            const username = evaluator.username || evaluator.depedEmail.split('@')[0].toLowerCase();

            const user = await User.findOne({ username: username });

            if (user) {
                if (user.evaluator_id === evaluator._id.toString()) {
                    alreadyLinkedCount++;
                } else {
                    user.evaluator_id = evaluator._id.toString();
                    await user.save();
                    updatedCount++;
                    updates.push({ username, evaluatorId: evaluator._id });
                }
            } else {
                notFoundCount++;
            }
        }

        res.json({
            message: 'Evaluator linking completed',
            totalEvaluators: evaluators.length,
            updated: updatedCount,
            alreadyLinked: alreadyLinkedCount,
            userNotFound: notFoundCount,
            updates
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fix email index issue (one-time use)
router.post('/fix-email-index', async (req: Request, res: Response) => {
    try {
        const { secretKey } = req.body;
        if (secretKey !== 'SEED_LREMS_2025') {
            return res.status(403).json({ message: 'Invalid secret key' });
        }

        // Drop the problematic email index
        const mongoose = require('mongoose');
        const collection = mongoose.connection.collection('users');

        try {
            await collection.dropIndex('email_1');
            res.json({ message: 'Email index dropped successfully. Now run seed-users.' });
        } catch (err: any) {
            if (err.code === 27) {
                res.json({ message: 'Index does not exist, proceed with seed-users.' });
            } else {
                throw err;
            }
        }
    } catch (error: any) {
        console.error('Fix index error:', error);
        res.status(500).json({ message: 'Failed to fix index', error: error.message });
    }
});

// Seed initial admin users (Remove after first use in production)
router.post('/seed-users', async (req: Request, res: Response) => {
    try {
        const { secretKey } = req.body;

        // Simple protection - require a secret key
        if (secretKey !== 'SEED_LREMS_2025') {
            return res.status(403).json({ message: 'Invalid secret key' });
        }

        const users = [
            { username: 'admin-l', name: 'ADMIN-L', email: 'admin-l@lrems.local', is_admin_access: true, access_rules: [{ learning_areas: ['*'], grade_levels: [] }] },
            { username: 'admin-c', name: 'ADMIN-C', email: 'admin-c@lrems.local', is_admin_access: true, access_rules: [{ learning_areas: ['*'], grade_levels: [] }] },
            { username: 'leo', name: 'Leo', email: 'leo@lrems.local', is_admin_access: false, access_rules: [{ learning_areas: ['Science'], grade_levels: [] }] },
            { username: 'celso', name: 'Celso', email: 'celso@lrems.local', is_admin_access: false, access_rules: [{ learning_areas: ['MATH', 'EPP', 'TLE'], grade_levels: [] }] },
            { username: 'nonie', name: 'Nonie', email: 'nonie@lrems.local', is_admin_access: true, access_rules: [{ learning_areas: ['*'], grade_levels: [] }] },
            { username: 'jc', name: 'JC', email: 'jc@lrems.local', is_admin_access: true, access_rules: [{ learning_areas: ['*'], grade_levels: [] }] },
        ];

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('BLRFACI123', salt);

        const results = [];
        for (const userData of users) {
            const existing = await User.findOne({ username: userData.username });
            if (existing) {
                results.push({ username: userData.username, status: 'exists' });
            } else {
                await User.create({ ...userData, password: hashedPassword });
                results.push({ username: userData.username, status: 'created' });
            }
        }

        res.json({ message: 'Seed completed', results, defaultPassword: 'BLRFACI123' });
    } catch (error: any) {
        console.error('Seed error:', error);
        res.status(500).json({ message: 'Seed failed', error: error.message });
    }
});

// Clear cache endpoint (for debugging)
router.post('/clear-cache', protect, async (req: Request, res: Response) => {
    try {
        cache.clearAll();
        console.log(`Cache cleared by user ${req.user?.username}`);
        res.json({ message: 'Cache cleared successfully' });
    } catch (error: any) {
        console.error('Clear cache error:', error);
        res.status(500).json({ message: 'Failed to clear cache', error: error.message });
    }
});

// Debug endpoint to check/reset/create user (Remove in production)
router.post('/debug-user', async (req: Request, res: Response) => {
    try {
        const { username } = req.body;
        let user = await User.findOne({ username });

        const Evaluator = require('../models/Evaluator').default;
        const evaluator = await Evaluator.findOne({ username });

        if (!evaluator) {
            return res.status(404).json({ message: 'Evaluator not found with this username' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('BLRLRE', salt);

        if (!user) {
            // Create missing user
            user = new User({
                username,
                password: hashedPassword,
                name: evaluator.name,
                access_rules: [],
                is_admin_access: false,
                evaluator_id: evaluator._id.toString(),
            });
            await user.save();

            return res.json({
                message: 'User account created and linked to evaluator',
                user: {
                    username: user.username,
                    name: user.name,
                    evaluator_id: user.evaluator_id
                }
            });
        }

        // Reset password if user exists
        user.password = hashedPassword;
        user.evaluator_id = evaluator._id.toString(); // Ensure link exists
        await user.save();

        res.json({
            message: 'User found and password reset to BLRLRE',
            user: {
                username: user.username,
                name: user.name,
                evaluator_id: user.evaluator_id,
                is_admin_access: user.is_admin_access
            }
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

export default router;
