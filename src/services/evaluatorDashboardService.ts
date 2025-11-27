import { apiClient } from './api';
import { EvaluatorAssignment, EvaluatorStats, DashboardStats } from '../types';

const API_BASE = '/evaluator-dashboard';

class EvaluatorDashboardService {
    async getOverallStats(): Promise<DashboardStats> {
        try {
            return await apiClient.get<DashboardStats>(`${API_BASE}/stats`);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async getEvaluatorAssignments(evaluatorId: string): Promise<EvaluatorAssignment[]> {
        try {
            return await apiClient.get<EvaluatorAssignment[]>(`${API_BASE}/${evaluatorId}/assignments`);
        } catch (error) {
            console.error('Error fetching evaluator assignments:', error);
            throw error;
        }
    }

    async getEvaluatorStats(evaluatorId: string): Promise<EvaluatorStats> {
        try {
            return await apiClient.get<EvaluatorStats>(`${API_BASE}/${evaluatorId}/stats`);
        } catch (error) {
            console.error('Error fetching evaluator stats:', error);
            throw error;
        }
    }

    async updateTaskStatus(
        evaluatorId: string,
        bookCode: string,
        taskField: string,
        status: string
    ): Promise<void> {
        try {
            await apiClient.patch(`${API_BASE}/${evaluatorId}/task-status`, {
                bookCode,
                taskField,
                status
            });
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    }
}

export const evaluatorDashboardService = new EvaluatorDashboardService();
