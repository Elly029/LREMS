const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
    async getAllEvaluators(): Promise<EvaluatorProfile[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluators`);
            if (!response.ok) {
                throw new Error('Failed to fetch evaluators');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching evaluators:', error);
            return [];
        }
    }

    async searchEvaluators(query: string): Promise<EvaluatorProfile[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluators/search?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to search evaluators');
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching evaluators:', error);
            return [];
        }
    }

    async createEvaluator(evaluator: Omit<EvaluatorProfile, '_id'>): Promise<EvaluatorProfile | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluators`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(evaluator),
            });

            if (!response.ok) {
                throw new Error('Failed to create evaluator');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating evaluator:', error);
            return null;
        }
    }

    async bulkCreateEvaluators(evaluators: Omit<EvaluatorProfile, '_id'>[]): Promise<{ success: boolean; count: number }> {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluators/bulk`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ evaluators }),
            });

            if (!response.ok) {
                throw new Error('Failed to bulk create evaluators');
            }

            const result = await response.json();
            return { success: true, count: result.evaluators.length };
        } catch (error) {
            console.error('Error bulk creating evaluators:', error);
            return { success: false, count: 0 };
        }
    }

    async updateEvaluator(id: string, evaluator: Partial<EvaluatorProfile>): Promise<EvaluatorProfile | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluators/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(evaluator),
            });

            if (!response.ok) {
                throw new Error('Failed to update evaluator');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating evaluator:', error);
            return null;
        }
    }

    async deleteEvaluator(id: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluators/${id}`, {
                method: 'DELETE',
            });

            return response.ok;
        } catch (error) {
            console.error('Error deleting evaluator:', error);
            return false;
        }
    }

    async toggleBlock(id: string, isBlocked: boolean): Promise<EvaluatorProfile | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/evaluators/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isBlocked }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle block evaluator');
            }

            return await response.json();
        } catch (error) {
            console.error('Error toggling block evaluator:', error);
            return null;
        }
    }
}

export const evaluatorService = new EvaluatorService();
