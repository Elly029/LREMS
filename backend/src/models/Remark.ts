import mongoose, { Schema, Document } from 'mongoose';

export interface IRemark extends Document {
  book_code: string;
  text: string;
  timestamp: Date;
  created_by?: string;
  from?: string;
  to?: string;
  from_date?: Date;
  to_date?: Date;
  status?: string;
  days_delay_deped?: number;
  days_delay_publisher?: number;
}

const RemarkSchema: Schema = new Schema(
  {
    book_code: {
      type: String,
      required: true,
      ref: 'Book',
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      type: String,
      trim: true,
    },
    from: {
      type: String,
      trim: true,
    },
    to: {
      type: String,
      trim: true,
    },
    from_date: {
      type: Date,
    },
    to_date: {
      type: Date,
    },
    status: {
      type: String,
      trim: true,
    },
    days_delay_deped: {
      type: Number,
      min: 0,
    },
    days_delay_publisher: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
RemarkSchema.index({ book_code: 1 });
RemarkSchema.index({ timestamp: -1 });

export default mongoose.model<IRemark>('Remark', RemarkSchema);
