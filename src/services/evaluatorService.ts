import { apiClient, ApiResponse } from './api';

export interface EvaluatorProfile {
    _id?: string;
    name: string;
    regionDivision: string;
    designation: string;
    contactNumber: string;
    depedEmail: string;
    username?: string;
    areaOfSpecialization: string;
    isBlocked?: boolean;
}

class EvaluatorService {
    async getEvaluator(id: string): Promise<EvaluatorProfile | null> {
        try {
            const response = await apiClient.get<ApiResponse<EvaluatorProfile>>(`/evaluators/${encodeURIComponent(id)}`);
            return response.data || response as any;
        } catch (error) {
            console.error('Error fetching evaluator:', error);
            return null;
        }
    }

    async getAllEvaluators(): Promise<EvaluatorProfile[]> {
        try {
            const response = await apiClient.get<ApiResponse<EvaluatorProfile[]>>('/evaluators');
            return response.data || response as any || [];
        } catch (error) {
            console.error('Error fetching evaluators:', error);
            return [];
        }
    }

    async searchEvaluators(query: string): Promise<EvaluatorProfile[]> {
        try {
            const response = await apiClient.get<ApiResponse<EvaluatorProfile[]>>('/evaluators/search', { query });
            return response.data || response as any || [];
        } catch (error) {
            console.error('Error searching evaluators:', error);
            return [];
        }
    }

    async createEvaluator(evaluator: Omit<EvaluatorProfile, '_id'>): Promise<EvaluatorProfile | null> {
        try {
            const response = await apiClient.post<ApiResponse<EvaluatorProfile>>('/evaluators', evaluator);
            return response.data || response as any;
        } catch (error) {
            console.error('Error creating evaluator:', error);
            return null;
        }
    }

    async bulkCreateEvaluators(evaluators: Omit<EvaluatorProfile, '_id'>[]): Promise<{ success: boolean; count: number }> {
        try {
            const response = await apiClient.post<ApiResponse<{ evaluators: EvaluatorProfile[] }>>('/evaluators/bulk', { evaluators });
            const result = response.data || response as any;
            return { success: true, count: result.evaluators?.length || 0 };
        } catch (error) {
            console.error('Error bulk creating evaluators:', error);
            return { success: false, count: 0 };
        }
    }

    async updateEvaluator(id: string, evaluator: Partial<EvaluatorProfile>): Promise<EvaluatorProfile | null> {
        try {
            const response = await apiClient.put<ApiResponse<EvaluatorProfile>>(`/evaluators/${encodeURIComponent(id)}`, evaluator);
            return response.data || response as any;
        } catch (error) {
            console.error('Error updating evaluator:', error);
            return null;
        }
    }

    async deleteEvaluator(id: string): Promise<boolean> {
        try {
            await apiClient.delete<ApiResponse>(`/evaluators/${encodeURIComponent(id)}`);
            return true;
        } catch (error) {
            console.error('Error deleting evaluator:', error);
            return false;
        }
    }

    async toggleBlock(id: string, isBlocked: boolean): Promise<EvaluatorProfile | null> {
        try {
            const response = await apiClient.put<ApiResponse<EvaluatorProfile>>(`/evaluators/${encodeURIComponent(id)}`, { isBlocked });
            return response.data || response as any;
        } catch (error) {
            console.error('Error toggling block evaluator:', error);
            return null;
        }
    }
}

export const evaluatorService = new EvaluatorService();
