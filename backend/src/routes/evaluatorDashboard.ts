import express, { Request, Response } from 'express';
import EvaluationMonitoring from '../models/EvaluationMonitoring';
import Evaluator from '../models/Evaluator';
import Book from '../models/Book';
import { protect } from '../middleware/auth';
import { ApiResponse } from '../types';
import cache from '../utils/cache';

const router = express.Router();

// Get overall statistics for all evaluators
router.get('/stats', protect, async (req: Request, res: Response) => {
    try {
        const [allEvaluators, allMonitoring] = await Promise.all([
            Evaluator.find(),
            EvaluationMonitoring.find()
        ]);

        // Calculate active evaluators (those with assignments)
        const evaluatorAssignments = new Map<string, number>();
        let totalAssignments = 0;
        let totalCompletedTasks = 0;
        let totalPossibleTasks = 0;

        allMonitoring.forEach(monitoring => {
            monitoring.evaluators.forEach(evaluator => {
                const count = evaluatorAssignments.get(evaluator.id) || 0;
                evaluatorAssignments.set(evaluator.id, count + 1);
                totalAssignments++;

                // Count completed tasks (6 tasks per evaluator per book)
                totalPossibleTasks += 6;
                if (evaluator.hasTxAndTm === 'Yes') totalCompletedTasks++;
                if (evaluator.individualUpload === 'Done') totalCompletedTasks++;
                if (evaluator.teamUpload === 'Done') totalCompletedTasks++;
                if (evaluator.txAndTmWithMarginalNotes === 'Done') totalCompletedTasks++;
                if (evaluator.signedSummaryForm === 'Done') totalCompletedTasks++;
                if (evaluator.clearance === 'Done') totalCompletedTasks++;
            });
        });

        const activeEvaluators = evaluatorAssignments.size;
        const averageCompletionRate = totalPossibleTasks > 0
            ? Math.round((totalCompletedTasks / totalPossibleTasks) * 100)
            : 0;

        const response: ApiResponse = {
            success: true,
            data: {
                totalEvaluators: allEvaluators.length,
                activeEvaluators,
                totalAssignments,
                averageCompletionRate
            }
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching dashboard statistics',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Get all book assignments for a specific evaluator
router.get('/:evaluatorId/assignments', protect, async (req: Request, res: Response) => {
    try {
        const { evaluatorId } = req.params;

        // Find all monitoring entries that include this evaluator
        const monitoringEntries = await EvaluationMonitoring.find({
            'evaluators.id': evaluatorId
        });

        // Get book details
        const bookCodes = monitoringEntries.map(m => m.book_code);
        const books = await Book.find({ book_code: { $in: bookCodes } });
        const bookMap = new Map(books.map(b => [b.book_code, b]));

        // Build assignments array
        const assignments = monitoringEntries.map(monitoring => {
            const evaluatorData = monitoring.evaluators.find(e => e.id === evaluatorId);
            const book = bookMap.get(monitoring.book_code);

            return {
                bookCode: monitoring.book_code,
                bookTitle: book?.title || 'Unknown',
                learningArea: monitoring.learning_area,
                gradeLevel: book?.grade_level || 0,
                publisher: book?.publisher || 'Unknown',
                eventName: monitoring.event_name,
                eventDate: monitoring.event_date,
                evaluatorData: evaluatorData || null
            };
        });

        const response: ApiResponse = {
            success: true,
            data: assignments
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching evaluator assignments:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching evaluator assignments',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Get statistics for a specific evaluator
router.get('/:evaluatorId/stats', protect, async (req: Request, res: Response) => {
    try {
        const { evaluatorId } = req.params;

        // Find all monitoring entries for this evaluator
        const monitoringEntries = await EvaluationMonitoring.find({
            'evaluators.id': evaluatorId
        });

        const totalAssignments = monitoringEntries.length;
        const taskBreakdown = {
            hasTxAndTm: { done: 0, pending: 0 },
            individualUpload: { done: 0, pending: 0 },
            teamUpload: { done: 0, pending: 0 },
            txAndTmWithMarginalNotes: { done: 0, pending: 0 },
            signedSummaryForm: { done: 0, pending: 0 },
            clearance: { done: 0, pending: 0 }
        };

        let completedAssignments = 0;
        let totalCompletedTasks = 0;
        let totalPossibleTasks = totalAssignments * 6;

        monitoringEntries.forEach(monitoring => {
            const evaluator = monitoring.evaluators.find(e => e.id === evaluatorId);
            if (!evaluator) return;

            // Count task statuses
            if (evaluator.hasTxAndTm === 'Yes') {
                taskBreakdown.hasTxAndTm.done++;
                totalCompletedTasks++;
            } else {
                taskBreakdown.hasTxAndTm.pending++;
            }

            if (evaluator.individualUpload === 'Done') {
                taskBreakdown.individualUpload.done++;
                totalCompletedTasks++;
            } else {
                taskBreakdown.individualUpload.pending++;
            }

            if (evaluator.teamUpload === 'Done') {
                taskBreakdown.teamUpload.done++;
                totalCompletedTasks++;
            } else {
                taskBreakdown.teamUpload.pending++;
            }

            if (evaluator.txAndTmWithMarginalNotes === 'Done') {
                taskBreakdown.txAndTmWithMarginalNotes.done++;
                totalCompletedTasks++;
            } else {
                taskBreakdown.txAndTmWithMarginalNotes.pending++;
            }

            if (evaluator.signedSummaryForm === 'Done') {
                taskBreakdown.signedSummaryForm.done++;
                totalCompletedTasks++;
            } else {
                taskBreakdown.signedSummaryForm.pending++;
            }

            if (evaluator.clearance === 'Done') {
                taskBreakdown.clearance.done++;
                totalCompletedTasks++;
            } else {
                taskBreakdown.clearance.pending++;
            }

            // Check if all tasks are done for this assignment
            if (
                evaluator.hasTxAndTm === 'Yes' &&
                evaluator.individualUpload === 'Done' &&
                evaluator.teamUpload === 'Done' &&
                evaluator.txAndTmWithMarginalNotes === 'Done' &&
                evaluator.signedSummaryForm === 'Done' &&
                evaluator.clearance === 'Done'
            ) {
                completedAssignments++;
            }
        });

        const pendingTasks = totalPossibleTasks - totalCompletedTasks;
        const completionPercentage = totalPossibleTasks > 0
            ? Math.round((totalCompletedTasks / totalPossibleTasks) * 100)
            : 0;

        const response: ApiResponse = {
            success: true,
            data: {
                totalAssignments,
                completedAssignments,
                pendingTasks,
                completionPercentage,
                taskBreakdown
            }
        };
        res.json(response);
    } catch (error) {
        console.error('Error fetching evaluator stats:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error fetching evaluator statistics',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

// Update task status for an evaluator on a specific book
router.patch('/:evaluatorId/task-status', protect, async (req: Request, res: Response) => {
    try {
        const { evaluatorId } = req.params;
        const { bookCode, taskField, status } = req.body;

        if (!bookCode || !taskField || !status) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Missing required fields: bookCode, taskField, or status',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(400).json(errorResponse);
        }

        // Valid task fields
        const validFields = [
            'hasTxAndTm',
            'individualUpload',
            'teamUpload',
            'txAndTmWithMarginalNotes',
            'signedSummaryForm',
            'clearance'
        ];

        if (!validFields.includes(taskField)) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid task field',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(400).json(errorResponse);
        }

        // Find the monitoring entry
        const monitoring = await EvaluationMonitoring.findOne({ book_code: bookCode });
        if (!monitoring) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Monitoring entry not found',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(404).json(errorResponse);
        }

        // Find the evaluator in the monitoring entry
        const evaluatorIndex = monitoring.evaluators.findIndex(e => e.id === evaluatorId);
        if (evaluatorIndex === -1) {
            const errorResponse: ApiResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Evaluator not found in this monitoring entry',
                    timestamp: new Date().toISOString(),
                    path: req.path,
                },
            };
            return res.status(404).json(errorResponse);
        }

        // Update the task status
        (monitoring.evaluators[evaluatorIndex] as any)[taskField] = status;
        await monitoring.save();
        
        // Invalidate cache
        cache.invalidateNamespace('monitoring:list');

        const response: ApiResponse = {
            success: true,
            data: monitoring,
            message: 'Task status updated successfully',
        };
        res.json(response);
    } catch (error) {
        console.error('Error updating task status:', error);
        const errorResponse: ApiResponse = {
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Error updating task status',
                timestamp: new Date().toISOString(),
                path: req.path,
            },
        };
        res.status(500).json(errorResponse);
    }
});

export default router;
