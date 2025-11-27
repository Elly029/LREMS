import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluator extends Document {
    name: string;
    regionDivision: string;
    designation: string;
    contactNumber: string;
    depedEmail: string;
    username?: string; // Generated from depedEmail (part before @)
    areaOfSpecialization: string;
    isBlocked?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EvaluatorSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        regionDivision: {
            type: String,
            required: true,
            trim: true,
        },
        designation: {
            type: String,
            required: true,
            trim: true,
        },
        contactNumber: {
            type: String,
            required: true,
            trim: true,
        },
        depedEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        username: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true, // Allow null but enforce uniqueness when present
        },
        areaOfSpecialization: {
            type: String,
            required: true,
            trim: true,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate username from email if not present
EvaluatorSchema.pre<IEvaluator>('save', function (next) {
    if (!this.username && this.depedEmail) {
        this.username = this.depedEmail.split('@')[0].toLowerCase();
    }
    next();
});

// Create index for faster searches
EvaluatorSchema.index({ name: 'text', depedEmail: 'text' });

export default mongoose.model<IEvaluator>('Evaluator', EvaluatorSchema);
