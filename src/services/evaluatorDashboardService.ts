import { apiClient, ApiResponse } from './api';
import { EvaluatorAssignment, EvaluatorStats, DashboardStats } from '../types';
import { emit } from '../events';

const API_BASE = '/evaluator-dashboard';

class EvaluatorDashboardService {
    async getOverallStats(): Promise<DashboardStats> {
        try {
            const response = await apiClient.get<ApiResponse<DashboardStats>>(`${API_BASE}/stats`);
            return response.data || response as any;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async getEvaluatorAssignments(evaluatorId: string): Promise<EvaluatorAssignment[]> {
        try {
            const response = await apiClient.get<ApiResponse<EvaluatorAssignment[]>>(`${API_BASE}/${encodeURIComponent(evaluatorId)}/assignments`);
            return response.data || response as any || [];
        } catch (error) {
            console.error('Error fetching evaluator assignments:', error);
            throw error;
        }
    }

    async getEvaluatorStats(evaluatorId: string): Promise<EvaluatorStats> {
        try {
            const response = await apiClient.get<ApiResponse<EvaluatorStats>>(`${API_BASE}/${encodeURIComponent(evaluatorId)}/stats`);
            return response.data || response as any;
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
            await apiClient.patch(`${API_BASE}/${encodeURIComponent(evaluatorId)}/task-status`, {
                bookCode,
                taskField,
                status
            });
            // Emit event to notify other components of the change
            emit('monitoring:changed', { type: 'taskUpdate', evaluatorId, bookCode, taskField, status });
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    }
}

export const evaluatorDashboardService = new EvaluatorDashboardService();
