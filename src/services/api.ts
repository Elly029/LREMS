import { Status } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const REQUEST_TIMEOUT = 10000;

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
        timestamp: string;
        path: string;
    };
}

export class ApiClient {
    private baseURL: string;
    private timeout: number;
    private token: string | null = null;

    constructor(baseURL: string = API_BASE_URL, timeout: number = REQUEST_TIMEOUT) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }

    setToken(token: string | null) {
        this.token = token;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const headers: any = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config: RequestInit = {
            signal: controller.signal,
            headers,
            ...options,
        };

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            const data = await response.json();

            if (!response.ok) {
                const error = new Error(data?.error?.message || `HTTP ${response.status}`);
                (error as any).code = data?.error?.code;
                (error as any).status = response.status;
                (error as any).details = data?.error?.details;
                throw error;
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout: The server took too long to respond');
                }
                if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    throw new Error('Network error: Unable to connect to the server');
                }
                throw error;
            }
            throw new Error('An unexpected error occurred');
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const searchParams = new URLSearchParams();

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => searchParams.append(key, v.toString()));
                    } else {
                        searchParams.append(key, value.toString());
                    }
                }
            });
        }

        const queryString = searchParams.toString();
        const url = queryString ? `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}?${queryString}` : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

        return this.request<T>(url, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}

export const apiClient = new ApiClient();
