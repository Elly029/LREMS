import { apiClient, ApiResponse } from './api';
import { emit } from '../events';
import { Book, Status, Remark } from '../types';

export interface BooksResponse {
    success: boolean;
    data: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: {
        availableStatuses: string[];
        availableLearningAreas: string[];
        availablePublishers: string[];
        gradeLevels: number[];
    };
}

function transformBookFromBackend(backendBook: any): Book {
    return {
        bookCode: backendBook.book_code,
        learningArea: backendBook.learning_area,
        gradeLevel: backendBook.grade_level,
        publisher: backendBook.publisher,
        title: backendBook.title,
        status: backendBook.status as Status,
        isNew: backendBook.is_new,
        ntpDate: backendBook.ntp_date,
        remarks: Array.isArray(backendBook.remarks) ? backendBook.remarks.map((remark: any) => ({
            id: remark._id?.toString() || remark.id, // Map MongoDB _id to id
            text: remark.text,
            timestamp: remark.timestamp,
            createdBy: remark.created_by,
            from: remark.from,
            to: remark.to,
            fromDate: remark.from_date,
            toDate: remark.to_date,
            status: remark.status,
            daysDelayDeped: remark.days_delay_deped,
            daysDelayPublisher: remark.days_delay_publisher,
        })) : [],
    };
}

export const bookApi = {
    async fetchBooks(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        adminView?: boolean;
    }) {
        const response = await apiClient.get<BooksResponse>('/books', params);

        const transformedBooks = response.data.map(transformBookFromBackend);

        return {
            books: transformedBooks,
            pagination: response.pagination,
            filters: response.filters,
        };
    },

    async getBook(bookCode: string) {
        const response = await apiClient.get<ApiResponse>(`/books/${bookCode}`);
        return transformBookFromBackend(response.data);
    },

    async createBook(bookData: {
        bookCode?: string;
        learningArea: string;
        gradeLevel: number;
        publisher: string;
        title: string;
        status: Status;
        isNew?: boolean;
        ntpDate?: string;
        remark?: string;
    }) {
        const backendData = {
            bookCode: bookData.bookCode,
            learningArea: bookData.learningArea,
            gradeLevel: bookData.gradeLevel,
            publisher: bookData.publisher,
            title: bookData.title,
            status: bookData.status,
            isNew: bookData.isNew || false,
            ntpDate: bookData.ntpDate,
            remark: bookData.remark,
        };

        const response = await apiClient.post<ApiResponse>('/books', backendData);
        const created = transformBookFromBackend(response.data);
        emit('books:changed', { type: 'create', book: created });
        return created;
    },

    async updateBook(bookCode: string, bookData: {
        bookCode?: string;
        learningArea?: string;
        gradeLevel?: number;
        publisher?: string;
        title?: string;
        status?: Status;
        isNew?: boolean;
        ntpDate?: string;
        remark?: string;
    }) {
        const backendData: any = {};

        // Only include bookCode if it's actually being changed
        if (bookData.bookCode && bookData.bookCode !== bookCode) {
            backendData.bookCode = bookData.bookCode;
        }

        if (bookData.learningArea) backendData.learningArea = bookData.learningArea;
        if (bookData.gradeLevel !== undefined) backendData.gradeLevel = bookData.gradeLevel;
        if (bookData.publisher) backendData.publisher = bookData.publisher;
        if (bookData.title) backendData.title = bookData.title;
        if (bookData.status !== undefined) backendData.status = bookData.status;
        if (bookData.isNew !== undefined) backendData.isNew = bookData.isNew;
        if (bookData.ntpDate !== undefined) backendData.ntpDate = bookData.ntpDate;
        if (bookData.remark) backendData.remark = bookData.remark;

        console.log('Updating book with data:', backendData);

        const response = await apiClient.put<ApiResponse>(`/books/${bookCode}`, backendData);
        const updated = transformBookFromBackend(response.data);
        emit('books:changed', { type: 'update', book: updated });
        return updated;
    },

    async deleteBook(bookCode: string) {
        await apiClient.delete<ApiResponse>(`/books/${bookCode}`);
        emit('books:changed', { type: 'delete', bookCode });
        return true;
    },

    async addRemark(bookCode: string, remark: Remark) {
        const backendData: any = {
            text: remark.text,
            timestamp: remark.timestamp,
        };

        if (remark.from !== undefined) backendData.from = remark.from;
        if (remark.to !== undefined) backendData.to = remark.to;
        if (remark.fromDate !== undefined) backendData.from_date = remark.fromDate;
        if (remark.toDate !== undefined) backendData.to_date = remark.toDate;
        if (remark.status !== undefined) backendData.status = remark.status;
        if (remark.daysDelayDeped !== undefined) backendData.days_delay_deped = remark.daysDelayDeped;
        if (remark.daysDelayPublisher !== undefined) backendData.days_delay_publisher = remark.daysDelayPublisher;

        console.log('Sending remark data:', backendData);
        const response = await apiClient.post<ApiResponse>(`/books/${bookCode}/remarks`, backendData);

        const created = {
            id: response.data._id,
            text: response.data.text,
            timestamp: response.data.timestamp,
            createdBy: response.data.created_by,
            from: response.data.from,
            to: response.data.to,
            fromDate: response.data.from_date,
            toDate: response.data.to_date,
            status: response.data.status,
            daysDelayDeped: response.data.days_delay_deped,
            daysDelayPublisher: response.data.days_delay_publisher,
        };
        emit('books:changed', { type: 'remark:create', bookCode, remark: created });
        return created;
    },

    async updateRemark(bookCode: string, remarkId: string, remark: Remark) {
        const backendData: any = {
            text: remark.text,
            timestamp: remark.timestamp,
        };

        if (remark.from !== undefined) backendData.from = remark.from;
        if (remark.to !== undefined) backendData.to = remark.to;
        if (remark.fromDate !== undefined) backendData.from_date = remark.fromDate;
        if (remark.toDate !== undefined) backendData.to_date = remark.toDate;
        if (remark.status !== undefined) backendData.status = remark.status;
        if (remark.daysDelayDeped !== undefined) backendData.days_delay_deped = remark.daysDelayDeped;
        if (remark.daysDelayPublisher !== undefined) backendData.days_delay_publisher = remark.daysDelayPublisher;

        console.log('Updating remark data:', backendData);
        const response = await apiClient.put<ApiResponse>(`/books/${bookCode}/remarks/${remarkId}`, backendData);

        const updated = {
            id: response.data._id,
            text: response.data.text,
            timestamp: response.data.timestamp,
            createdBy: response.data.created_by,
            from: response.data.from,
            to: response.data.to,
            fromDate: response.data.from_date,
            toDate: response.data.to_date,
            status: response.data.status,
            daysDelayDeped: response.data.days_delay_deped,
            daysDelayPublisher: response.data.days_delay_publisher,
        };
        emit('books:changed', { type: 'remark:update', bookCode, remarkId, remark: updated });
        return updated;
    },

    async deleteRemark(bookCode: string, remarkId: string) {
        await apiClient.delete(`/books/${bookCode}/remarks/${remarkId}`);
        emit('books:changed', { type: 'remark:delete', bookCode, remarkId });
    },
};
