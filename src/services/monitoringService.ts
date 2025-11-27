import { apiClient, ApiResponse } from './api';
import { EvaluatorMonitoring } from '../types';

// Transform backend format to frontend format
function transformMonitoringFromBackend(backendEntry: any): EvaluatorMonitoring {
    return {
        bookCode: backendEntry.book_code || backendEntry.bookCode,
        learningArea: backendEntry.learning_area || backendEntry.learningArea,
        evaluators: backendEntry.evaluators || [],
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
    async fetchAll() {
        const response = await apiClient.get<ApiResponse>('/monitoring');
        
        if (response.data && Array.isArray(response.data)) {
            return response.data.map(transformMonitoringFromBackend);
        }
        
        return [];
    },

    async getByBookCode(bookCode: string) {
        const response = await apiClient.get<ApiResponse>(`/monitoring/${bookCode}`);
        return transformMonitoringFromBackend(response.data);
    },

    async create(entry: Omit<EvaluatorMonitoring, 'evaluators'> & { evaluators?: any[] }) {
        const backendData = transformMonitoringToBackend(entry);
        const response = await apiClient.post<ApiResponse>('/monitoring', backendData);
        return transformMonitoringFromBackend(response.data);
    },

    async bulkCreate(entries: Array<Omit<EvaluatorMonitoring, 'evaluators'> & { evaluators?: any[] }>) {
        const backendData = entries.map(transformMonitoringToBackend);
        const response = await apiClient.post<ApiResponse>('/monitoring/bulk', { entries: backendData });
        return response.data;
    },

    async update(bookCode: string, entry: Partial<EvaluatorMonitoring>) {
        const backendData = transformMonitoringToBackend(entry);
        const response = await apiClient.put<ApiResponse>(`/monitoring/${bookCode}`, backendData);
        return transformMonitoringFromBackend(response.data);
    },

    async delete(bookCode: string) {
        await apiClient.delete<ApiResponse>(`/monitoring/${bookCode}`);
        return true;
    },
};
