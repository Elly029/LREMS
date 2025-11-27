import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluator {
  id: string;
  name: string;
  regionDivision: string;
  designation: string;
  contactNumber: string;
  depedEmail: string;
  areaOfSpecialization: string;
  areasOfEvaluation: string[];
  hasTxAndTm: 'Yes' | 'No';
  individualUpload: 'Done' | 'Pending' | 'Ongoing Evaluation';
  teamUpload: 'Done' | 'Pending' | 'Ongoing Evaluation';
  txAndTmWithMarginalNotes: 'Done' | 'Pending' | 'Ongoing Evaluation';
  signedSummaryForm: 'Done' | 'Pending' | 'Ongoing Evaluation';
  clearance: 'Done' | 'Pending' | 'Ongoing Evaluation';
}

export interface IEvaluationMonitoring extends Document {
  book_code: string;
  learning_area: string;
  evaluators: IEvaluator[];
  event_name?: string;
  event_date?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

const EvaluatorSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  regionDivision: { type: String, required: true },
  designation: { type: String, required: true },
  contactNumber: { type: String, required: true },
  depedEmail: { type: String, required: true },
  areaOfSpecialization: { type: String, required: true },
  areasOfEvaluation: [{ type: String }],
  hasTxAndTm: { type: String, enum: ['Yes', 'No'], default: 'No' },
  individualUpload: { type: String, enum: ['Done', 'Pending', 'Ongoing Evaluation'], default: 'Pending' },
  teamUpload: { type: String, enum: ['Done', 'Pending', 'Ongoing Evaluation'], default: 'Pending' },
  txAndTmWithMarginalNotes: { type: String, enum: ['Done', 'Pending', 'Ongoing Evaluation'], default: 'Pending' },
  signedSummaryForm: { type: String, enum: ['Done', 'Pending', 'Ongoing Evaluation'], default: 'Pending' },
  clearance: { type: String, enum: ['Done', 'Pending', 'Ongoing Evaluation'], default: 'Pending' },
}, { _id: false });

const EvaluationMonitoringSchema: Schema = new Schema(
  {
    book_code: {
      type: String,
      required: true,
      trim: true,
    },
    learning_area: {
      type: String,
      required: true,
      trim: true,
    },
    evaluators: {
      type: [EvaluatorSchema],
      default: [],
    },
    event_name: {
      type: String,
      trim: true,
    },
    event_date: {
      type: String,
      trim: true,
    },
    created_by: {
      type: String,
      trim: true,
    },
    updated_by: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes
EvaluationMonitoringSchema.index({ book_code: 1 }, { unique: true });
EvaluationMonitoringSchema.index({ learning_area: 1 });
EvaluationMonitoringSchema.index({ event_name: 1 });

export default mongoose.model<IEvaluationMonitoring>('EvaluationMonitoring', EvaluationMonitoringSchema);
