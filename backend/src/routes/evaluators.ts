import express, { Request, Response } from 'express';
import Evaluator from '../models/Evaluator';
import { protect } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = express.Router();

// Get all evaluators
router.get('/', protect, async (req: Request, res: Response) => {
    try {
        const evaluators = await Evaluator.find().sort({ name: 1 });
        const response: ApiResponse = {
            success: true,
            data: evaluators,
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching evaluators:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching evaluators',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Search evaluators by name
router.get('/search', protect, async (req: Request, res: Response) => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Query parameter is required',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(400).json(errorResponse);
        }

        const evaluators = await Evaluator.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { depedEmail: { $regex: query, $options: 'i' } },
            ],
        }).limit(10);

        const response: ApiResponse = {
            success: true,
            data: evaluators,
        };
        res.json(response);
    } catch (error) {
        console.error('Error searching evaluators:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error searching evaluators',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Get evaluator by ID
router.get('/:id', protect, async (req: Request, res: Response) => {
    try {
        const evaluator = await Evaluator.findById(req.params.id);

        if (!evaluator) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Evaluator not found',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(404).json(errorResponse);
        }

        const response: ApiResponse = {
            success: true,
            data: evaluator,
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching evaluator:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching evaluator',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Create new evaluator
router.post('/', protect, async (req: Request, res: Response) => {
    try {
        const evaluator = new Evaluator(req.body);
        await evaluator.save();
        const response: ApiResponse = {
            success: true,
            data: evaluator,
            message: 'Evaluator created successfully',
        };
        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating evaluator:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error creating evaluator',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Bulk create evaluators
router.post('/bulk', protect, async (req: Request, res: Response) => {
    try {
        const { evaluators } = req.body;

        if (!Array.isArray(evaluators)) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Evaluators must be an array',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(400).json(errorResponse);
        }

        const createdEvaluators = await Evaluator.insertMany(evaluators);
        const response: ApiResponse = {
            success: true,
            data: { evaluators: createdEvaluators },
            message: `Successfully created ${createdEvaluators.length} evaluators`,
        };
        res.status(201).json(response);
    } catch (error) {
        console.error('Error bulk creating evaluators:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error bulk creating evaluators',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Update evaluator
router.put('/:id', protect, async (req: Request, res: Response) => {
    try {
        const evaluator = await Evaluator.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!evaluator) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Evaluator not found',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(404).json(errorResponse);
        }

        const response: ApiResponse = {
            success: true,
            data: evaluator,
            message: 'Evaluator updated successfully',
        };
        res.json(response);
    } catch (error) {
        console.error('Error updating evaluator:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating evaluator',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Delete evaluator
router.delete('/:id', protect, async (req: Request, res: Response) => {
    try {
        const evaluator = await Evaluator.findByIdAndDelete(req.params.id);

        if (!evaluator) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Evaluator not found',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(404).json(errorResponse);
        }

        const response: ApiResponse = {
            success: true,
            message: 'Evaluator deleted successfully',
        };
        res.json(response);
    } catch (error) {
        console.error('Error deleting evaluator:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error deleting evaluator',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Fix monitoring IDs (migration endpoint)
router.post('/fix-monitoring-ids', async (req: Request, res: Response) => {
    try {
        // Dynamic import to avoid circular dependencies or load issues if not used elsewhere
        const EvaluationMonitoring = require('../models/EvaluationMonitoring').default;

        const evaluators = await Evaluator.find();
        const monitoringEntries = await EvaluationMonitoring.find();

        // Create map of email -> evaluator ID
        const emailToIdMap = new Map<string, string>();
        evaluators.forEach(e => {
            if (e.depedEmail) {
                emailToIdMap.set(e.depedEmail.toLowerCase(), e._id.toString());
            }
        });

        let updatedCount = 0;
        let fixedEvaluatorsCount = 0;

        for (const entry of monitoringEntries) {
            let entryUpdated = false;

            // Check each evaluator in the monitoring entry
            // We need to mutate the array or map it
            if (entry.evaluators && Array.isArray(entry.evaluators)) {
                entry.evaluators.forEach((ev: any) => {
                    if (ev.depedEmail) {
                        const correctId = emailToIdMap.get(ev.depedEmail.toLowerCase());
                        if (correctId && correctId !== ev.id) {
                            ev.id = correctId;
                            entryUpdated = true;
                            fixedEvaluatorsCount++;
                        }
                    }
                });
            }

            if (entryUpdated) {
                // Mongoose might not detect deep changes in mixed/array types sometimes, so markModified
                entry.markModified('evaluators');
                await entry.save();
                updatedCount++;
            }
        }

        res.json({
            message: 'Monitoring IDs fixed',
            updatedEntries: updatedCount,
            fixedEvaluators: fixedEvaluatorsCount
        });
    } catch (error) {
        console.error('Error fixing monitoring IDs:', error);
        res.status(500).json({ message: 'Error fixing monitoring IDs' });
    }
});

// Populate usernames for all evaluators (migration endpoint)
router.post('/populate-usernames', async (req: Request, res: Response) => {
    try {
        const evaluators = await Evaluator.find();

        const updated = [];
        const skipped = [];
        const errors = [];

        for (const evaluator of evaluators) {
            try {
                // Skip if username already exists
                if (evaluator.username) {
                    skipped.push({
                        name: evaluator.name,
                        username: evaluator.username,
                        reason: 'Username already exists'
                    });
                    continue;
                }

                // Generate username from email
                const username = evaluator.depedEmail.split('@')[0].toLowerCase();
                evaluator.username = username;
                await evaluator.save();

                updated.push({
                    name: evaluator.name,
                    email: evaluator.depedEmail,
                    username: username
                });
            } catch (error: any) {
                errors.push({
                    name: evaluator.name,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Username population completed',
            total: evaluators.length,
            updated: updated.length,
            skipped: skipped.length,
            errors: errors.length,
            updatedEvaluators: updated,
            skippedEvaluators: skipped,
            errorDetails: errors
        });
    } catch (error) {
        console.error('Error populating usernames:', error);
        res.status(500).json({ message: 'Error populating usernames' });
    }
});

export default router;
