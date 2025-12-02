import { apiClient, ApiResponse } from './api';
import { EvaluatorMonitoring } from '../types';
import { emit } from '../events';

// Transform backend format to frontend format
function transformMonitoringFromBackend(backendEntry: any): EvaluatorMonitoring {
    if (!backendEntry) return backendEntry;
    return {
        bookCode: backendEntry.book_code || backendEntry.bookCode,
        learningArea: backendEntry.learning_area || backendEntry.learningArea,
        evaluators: (backendEntry.evaluators || []).map((ev: any) => ({
            id: ev.id || ev._id,
            name: ev.name,
            regionDivision: ev.regionDivision,
            designation: ev.designation,
            contactNumber: ev.contactNumber,
            depedEmail: ev.depedEmail,
            areaOfSpecialization: ev.areaOfSpecialization,
            areasOfEvaluation: ev.areasOfEvaluation || [],
            hasTxAndTm: ev.hasTxAndTm || 'No',
            individualUpload: ev.individualUpload || 'Pending',
            teamUpload: ev.teamUpload || 'Pending',
            txAndTmWithMarginalNotes: ev.txAndTmWithMarginalNotes || 'Pending',
            signedSummaryForm: ev.signedSummaryForm || 'Pending',
            clearance: ev.clearance || 'Pending',
        })),
        eventName: backendEntry.event_name || backendEntry.eventName,
        eventDate: backendEntry.event_date || backendEntry.eventDate,
    };
}

// Transform frontend format to backend format
function transformMonitoringToBackend(frontendEntry: Partial<EvaluatorMonitoring>): any {
    return {
        bookCode: frontendEntry.bookCode,
        learningArea: frontendEntry.learningArea,
        evaluators: frontendEntry.evaluators,
        eventName: frontendEntry.eventName,
        eventDate: frontendEntry.eventDate,
    };
}

export const monitoringApi = {
    async fetchAll(): Promise<EvaluatorMonitoring[]> {
        try {
            const response = await apiClient.get<ApiResponse>('/monitoring');
            
            if (response.data && Array.isArray(response.data)) {
                return response.data.map(transformMonitoringFromBackend);
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching monitoring data:', error);
            throw error;
        }
    },

    async getByBookCode(bookCode: string): Promise<EvaluatorMonitoring> {
        try {
            const response = await apiClient.get<ApiResponse>(`/monitoring/${encodeURIComponent(bookCode)}`);
            return transformMonitoringFromBackend(response.data);
        } catch (error) {
            console.error(`Error fetching monitoring entry for ${bookCode}:`, error);
            throw error;
        }
    },

    async create(entry: Omit<EvaluatorMonitoring, 'evaluators'> & { evaluators?: any[] }): Promise<EvaluatorMonitoring> {
        try {
            const backendData = transformMonitoringToBackend(entry);
            const response = await apiClient.post<ApiResponse>('/monitoring', backendData);
            const created = transformMonitoringFromBackend(response.data);
            emit('monitoring:changed', { type: 'create', entry: created });
            return created;
        } catch (error) {
            console.error('Error creating monitoring entry:', error);
            throw error;
        }
    },

    async bulkCreate(entries: Array<Omit<EvaluatorMonitoring, 'evaluators'> & { evaluators?: any[] }>): Promise<{ results: EvaluatorMonitoring[]; errors: any[] }> {
        try {
            const backendData = entries.map(transformMonitoringToBackend);
            const response = await apiClient.post<ApiResponse>('/monitoring/bulk', { entries: backendData });
            const result = {
                results: (response.data?.results || []).map(transformMonitoringFromBackend),
                errors: response.data?.errors || [],
            };
            emit('monitoring:changed', { type: 'bulkCreate', entries: result.results });
            return result;
        } catch (error) {
            console.error('Error bulk creating monitoring entries:', error);
            throw error;
        }
    },

    async update(bookCode: string, entry: Partial<EvaluatorMonitoring>): Promise<EvaluatorMonitoring> {
        try {
            const backendData = transformMonitoringToBackend(entry);
            const response = await apiClient.put<ApiResponse>(`/monitoring/${encodeURIComponent(bookCode)}`, backendData);
            const updated = transformMonitoringFromBackend(response.data);
            emit('monitoring:changed', { type: 'update', entry: updated });
            return updated;
        } catch (error) {
            console.error(`Error updating monitoring entry for ${bookCode}:`, error);
            throw error;
        }
    },

    async delete(bookCode: string): Promise<boolean> {
        try {
            await apiClient.delete<ApiResponse>(`/monitoring/${encodeURIComponent(bookCode)}`);
            emit('monitoring:changed', { type: 'delete', bookCode });
            return true;
        } catch (error) {
            console.error(`Error deleting monitoring entry for ${bookCode}:`, error);
            throw error;
        }
    },
};
