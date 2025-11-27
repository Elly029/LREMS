import express, { Request, Response } from 'express';
import Evaluator from '../models/Evaluator';

const router = express.Router();

// Get all evaluators
router.get('/', async (req: Request, res: Response) => {
    try {
        const evaluators = await Evaluator.find().sort({ name: 1 });
        res.json(evaluators);
    } catch (error) {
        console.error('Error fetching evaluators:', error);
        res.status(500).json({ message: 'Error fetching evaluators' });
    }
});

// Search evaluators by name
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        const evaluators = await Evaluator.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { depedEmail: { $regex: query, $options: 'i' } },
            ],
        }).limit(10);

        res.json(evaluators);
    } catch (error) {
        console.error('Error searching evaluators:', error);
        res.status(500).json({ message: 'Error searching evaluators' });
    }
});

// Get evaluator by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const evaluator = await Evaluator.findById(req.params.id);

        if (!evaluator) {
            return res.status(404).json({ message: 'Evaluator not found' });
        }

        res.json(evaluator);
    } catch (error) {
        console.error('Error fetching evaluator:', error);
        res.status(500).json({ message: 'Error fetching evaluator' });
    }
});

// Create new evaluator
router.post('/', async (req: Request, res: Response) => {
    try {
        const evaluator = new Evaluator(req.body);
        await evaluator.save();
        res.status(201).json(evaluator);
    } catch (error) {
        console.error('Error creating evaluator:', error);
        res.status(500).json({ message: 'Error creating evaluator' });
    }
});

// Bulk create evaluators
router.post('/bulk', async (req: Request, res: Response) => {
    try {
        const { evaluators } = req.body;

        if (!Array.isArray(evaluators)) {
            return res.status(400).json({ message: 'Evaluators must be an array' });
        }

        const createdEvaluators = await Evaluator.insertMany(evaluators);
        res.status(201).json({
            message: `Successfully created ${createdEvaluators.length} evaluators`,
            evaluators: createdEvaluators,
        });
    } catch (error) {
        console.error('Error bulk creating evaluators:', error);
        res.status(500).json({ message: 'Error bulk creating evaluators' });
    }
});

// Update evaluator
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const evaluator = await Evaluator.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!evaluator) {
            return res.status(404).json({ message: 'Evaluator not found' });
        }

        res.json(evaluator);
    } catch (error) {
        console.error('Error updating evaluator:', error);
        res.status(500).json({ message: 'Error updating evaluator' });
    }
});

// Delete evaluator
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const evaluator = await Evaluator.findByIdAndDelete(req.params.id);

        if (!evaluator) {
            return res.status(404).json({ message: 'Evaluator not found' });
        }

        res.json({ message: 'Evaluator deleted successfully' });
    } catch (error) {
        console.error('Error deleting evaluator:', error);
        res.status(500).json({ message: 'Error deleting evaluator' });
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
