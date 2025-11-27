import mongoose, { Schema, Document } from 'mongoose';
import { BookStatus } from '../types';

export interface IBook extends Document {
  book_code: string;
  learning_area: string;
  grade_level: number;
  publisher: string;
  title: string;
  status: BookStatus;
  // remarks?: string; // Removed to avoid confusion with remarks relationship
  is_new: boolean;
  ntp_date?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}



const BookSchema: Schema = new Schema(
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
    grade_level: {
      type: Number,
      required: true,
      min: 1,
    },
    publisher: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'For Evaluation',
        'For Revision',
        'For ROR',
        'For Finalization',
        'For FRR and Signing Off',
        'Final Revised copy',
        'NOT FOUND',
        'RETURNED',
        'DQ/FOR RETURN',
        'In Progress'
      ],
      default: 'For Evaluation',
    },
    // remarks field removed as it is handled by a separate collection

    is_new: {
      type: Boolean,
      default: true,
    },
    ntp_date: {
      type: Date,
      required: false,
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
BookSchema.index({ book_code: 1 }, { unique: true });
BookSchema.index({ status: 1 });
BookSchema.index({ learning_area: 1 });
BookSchema.index({ grade_level: 1 });

export default mongoose.model<IBook>('Book', BookSchema);
