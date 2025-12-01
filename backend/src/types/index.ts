// Type definitions for the Grades 1 and 3 TX and TM records

export enum Status {
  ForEvaluation = 'For Evaluation',
  ForRevision = 'For Revision',
  ForROR = 'For ROR',
  ForFinalization = 'For Finalization',
  ForFRR = 'For FRR and Signing Off',
  FinalRevisedCopy = 'Final Revised copy',
  NotFound = 'NOT FOUND',
  Returned = 'RETURNED',
  DqForReturn = 'DQ/FOR RETURN',
  InProgress = 'In Progress',
}

export type BookStatus = Status;

export interface Remark {
  id: string;
  book_code: string;
  text: string;
  timestamp: string;
  created_by?: string;
}

export interface Book {
  book_code: string;
  learning_area: string;
  grade_level: number;
  publisher: string;
  title: string;
  status: Status;
  is_new: boolean;
  ntp_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  remarks?: Remark[];
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  revoked_at?: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_by?: string;
  changed_at: string;
}

// API Request/Response Types
export interface CreateBookRequest {
  bookCode?: string;
  learningArea: string;
  gradeLevel: number;
  publisher: string;
  title: string;
  status: Status;
  isNew?: boolean;
  ntpDate?: string;
  remark?: string;
}

export interface UpdateBookRequest {
  bookCode?: string;
  learningArea?: string;
  gradeLevel?: number;
  publisher?: string;
  title?: string;
  status?: Status;
  isNew?: boolean;
  ntpDate?: string;
  remark?: string;
}

export interface AddRemarkRequest {
  text: string;
  timestamp?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface BooksQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string[];
  learningArea?: string[];
  gradeLevel?: number[];
  publisher?: string[];
  hasRemarks?: boolean;
  adminView?: boolean;
  cursor?: string;
}

export interface BooksResponse {
  success: boolean;
  data: Book[];
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
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// JWT Payload
export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Database types for Knex
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
  };
}

// Evaluation Monitoring Types
export interface Evaluator {
  id: string;
  name: string;
  regionDivision: string;
  designation: string;
  contactNumber: string;
  depedEmail: string;
  areaOfSpecialization: string;
  areasOfEvaluation: string[];
  hasTxAndTm: 'Yes' | 'No';
  individualUpload: 'Done' | 'Pending';
  teamUpload: 'Done' | 'Pending';
  txAndTmWithMarginalNotes: 'Done' | 'Pending';
  signedSummaryForm: 'Done' | 'Pending';
  clearance: 'Done' | 'Pending';
}

export interface EvaluationMonitoring {
  book_code: string;
  learning_area: string;
  evaluators: Evaluator[];
  event_name?: string;
  event_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}
