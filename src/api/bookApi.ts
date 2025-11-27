// Book API Service
import { apiClient, type ApiResponse, type BooksResponse } from './client';
import { Book, Remark, Status } from '../types';

// Transform backend Book format to frontend Book format
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
    remarks: Array.isArray(backendBook.remarks) 
      ? backendBook.remarks.map(transformRemarkFromBackend)
      : [],
  };
}

// Transform frontend Book format to backend format
function transformBookToBackend(frontendBook: Partial<Book>): any {
  const backendBook: any = {};
  
  if (frontendBook.bookCode) backendBook.book_code = frontendBook.bookCode;
  if (frontendBook.learningArea) backendBook.learning_area = frontendBook.learningArea;
  if (frontendBook.gradeLevel !== undefined) backendBook.grade_level = frontendBook.gradeLevel;
  if (frontendBook.publisher) backendBook.publisher = frontendBook.publisher;
  if (frontendBook.title) backendBook.title = frontendBook.title;
  if (frontendBook.status) backendBook.status = frontendBook.status;
  if (frontendBook.isNew !== undefined) backendBook.is_new = frontendBook.isNew;
  
  return backendBook;
}

// Transform backend Remark format to frontend Remark format
function transformRemarkFromBackend(backendRemark: any): Remark {
  return {
    id: backendRemark._id || backendRemark.id,
    text: backendRemark.text,
    timestamp: backendRemark.timestamp,
    createdBy: backendRemark.created_by,
    from: backendRemark.from,
    to: backendRemark.to,
    fromDate: backendRemark.from_date,
    toDate: backendRemark.to_date,
    status: backendRemark.status,
    daysDelayDeped: backendRemark.days_delay_deped,
    daysDelayPublisher: backendRemark.days_delay_publisher,
  };
}

// Transform frontend Remark format to backend Remark format
function transformRemarkToBackend(frontendRemark: Remark): any {
  return {
    text: frontendRemark.text,
    timestamp: frontendRemark.timestamp,
    created_by: frontendRemark.createdBy,
    from: frontendRemark.from,
    to: frontendRemark.to,
    from_date: frontendRemark.fromDate,
    to_date: frontendRemark.toDate,
    status: frontendRemark.status,
    days_delay_deped: frontendRemark.daysDelayDeped,
    days_delay_publisher: frontendRemark.daysDelayPublisher,
  };
}

// API Functions
export const bookApi = {
  // Fetch books with filtering, search, and pagination
  async fetchBooks(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const response = await apiClient.get<BooksResponse>('/books', params);
      
      // Transform books from backend format to frontend format
      const transformedBooks = response.data.map(transformBookFromBackend);
      
      return {
        books: transformedBooks,
        pagination: response.pagination,
        filters: response.filters,
      };
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Create a new book
  async createBook(bookData: {
    learningArea: string;
    gradeLevel: number;
    publisher: string;
    title: string;
    status: Status;
    isNew?: boolean;
    remark?: string;
  }) {
    try {
      const backendData = {
        learningArea: bookData.learningArea,
        gradeLevel: bookData.gradeLevel,
        publisher: bookData.publisher,
        title: bookData.title,
        status: bookData.status,
        isNew: bookData.isNew || false,
        remark: bookData.remark,
      };

      const response = await apiClient.post<ApiResponse>('/books', backendData);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create book');
      }

      return transformBookFromBackend(response.data);
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Update an existing book
  async updateBook(bookCode: string, bookData: {
    learningArea?: string;
    gradeLevel?: number;
    publisher?: string;
    title?: string;
    status?: Status;
    isNew?: boolean;
    remark?: string;
  }) {
    try {
      const backendData = transformBookToBackend(bookData);
      
      if (bookData.remark) {
        backendData.remark = bookData.remark;
      }

      const response = await apiClient.put<ApiResponse>(`/books/${bookCode}`, backendData);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update book');
      }

      return transformBookFromBackend(response.data);
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  // Delete a book
  async deleteBook(bookCode: string) {
    try {
      const response = await apiClient.delete<ApiResponse>(`/books/${bookCode}`);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete book');
      }

      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  // Add a remark to a book
  async addRemark(bookCode: string, remark: Remark) {
    try {
      const backendData: any = {
        text: remark.text,
        timestamp: remark.timestamp,
      };

      if (remark.from) backendData.from = remark.from;
      if (remark.to) backendData.to = remark.to;
      if (remark.fromDate) backendData.from_date = remark.fromDate;
      if (remark.toDate) backendData.to_date = remark.toDate;
      if (remark.status) backendData.status = remark.status;
      if (remark.daysDelayDeped !== undefined) backendData.days_delay_deped = remark.daysDelayDeped;
      if (remark.daysDelayPublisher !== undefined) backendData.days_delay_publisher = remark.daysDelayPublisher;

      const response = await apiClient.post<ApiResponse>(`/books/${bookCode}/remarks`, backendData);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to add remark');
      }

      return {
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
    } catch (error) {
      console.error('Error adding remark:', error);
      throw error;
    }
  },

  // Update a remark on a book
  async updateRemark(bookCode: string, remarkId: string, remark: Remark) {
    try {
      const backendData: any = {
        text: remark.text,
        timestamp: remark.timestamp,
      };

      if (remark.from) backendData.from = remark.from;
      if (remark.to) backendData.to = remark.to;
      if (remark.fromDate) backendData.from_date = remark.fromDate;
      if (remark.toDate) backendData.to_date = remark.toDate;
      if (remark.status) backendData.status = remark.status;
      if (remark.daysDelayDeped !== undefined) backendData.days_delay_deped = remark.daysDelayDeped;
      if (remark.daysDelayPublisher !== undefined) backendData.days_delay_publisher = remark.daysDelayPublisher;

      const response = await apiClient.put<ApiResponse>(`/books/${bookCode}/remarks/${remarkId}`, backendData);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update remark');
      }

      return {
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
    } catch (error) {
      console.error('Error updating remark:', error);
      throw error;
    }
  },

  // Get a single book by code
  async getBookByCode(bookCode: string) {
    try {
      const response = await apiClient.get<ApiResponse>(`/books/${bookCode}`);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch book');
      }

      return transformBookFromBackend(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },
};

export default bookApi;