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
  RTP = 'RTP',
}

export interface Remark {
  id?: string;
  text: string;
  timestamp: string;
  createdBy?: string;
  from?: string;
  to?: string;
  fromDate?: string | null;
  toDate?: string | null;
  status?: string;
  daysDelayDeped?: number;
  daysDelayPublisher?: number;
}

export interface Book {
  bookCode: string;
  learningArea: string;
  gradeLevel: number;
  publisher: string;
  title: string;
  status: Status;
  remarks: Remark[];
  isNew?: boolean;
  ntpDate?: string;
}


export interface SortConfig<T> {
  key: keyof T;
  direction: 'ascending' | 'descending';
}

export interface Evaluator {
  id: string;
  name: string;
  regionDivision: string;
  designation: string;
  contactNumber: string;
  depedEmail: string;
  areaOfSpecialization: string;
  areasOfEvaluation: string[]; // Changed to array to support multiple areas
  hasTxAndTm: 'Yes' | 'No';
  individualUpload: 'Done' | 'Pending' | 'Ongoing Evaluation';
  teamUpload: 'Done' | 'Pending' | 'Ongoing Evaluation';
  txAndTmWithMarginalNotes: 'Done' | 'Pending' | 'Ongoing Evaluation';
  signedSummaryForm: 'Done' | 'Pending' | 'Ongoing Evaluation';
  clearance: 'Done' | 'Pending' | 'Ongoing Evaluation';
}

export interface EvaluatorMonitoring {
  bookCode: string;
  learningArea: string;
  evaluators: Evaluator[];
  eventName?: string;
  eventDate?: string;
}

// Evaluator Dashboard types
export interface EvaluatorAssignment {
  bookCode: string;
  bookTitle: string;
  learningArea: string;
  gradeLevel: number;
  publisher: string;
  eventName?: string;
  eventDate?: string;
  evaluatorData: Evaluator | null;
}

export interface EvaluatorStats {
  totalAssignments: number;
  completedAssignments: number;
  pendingTasks: number;
  completionPercentage: number;
  taskBreakdown: {
    hasTxAndTm: { done: number; pending: number };
    individualUpload: { done: number; pending: number };
    teamUpload: { done: number; pending: number };
    txAndTmWithMarginalNotes: { done: number; pending: number };
    signedSummaryForm: { done: number; pending: number };
    clearance: { done: number; pending: number };
  };
}

export interface DashboardStats {
  totalEvaluators: number;
  activeEvaluators: number;
  totalAssignments: number;
  averageCompletionRate: number;
}

export interface AccessRule {
  learning_areas: string[];
  grade_levels: number[];
}

export interface User {
  _id: string;
  username: string;
  name: string;
  token: string;
  access_rules?: AccessRule[];
  is_admin_access?: boolean;
  evaluator_id?: string;
  role?: string;
}
