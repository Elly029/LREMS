
import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessRule {
    learning_areas: string[]; // Use ["*"] for all
    grade_levels: number[];   // Use [] for all
}

export interface IUser extends Document {
    username: string;
    email?: string; // Optional email field to resolve database index issue
    password: string; // Hashed
    name: string;
    access_rules: IAccessRule[];
    access_rules_version: number; // Incremented when access rules change - for cache invalidation
    is_admin_access?: boolean;
    evaluator_id?: string; // Link to Evaluator profile
    role: 'Administrator' | 'Facilitator' | 'Evaluator';
    created_at: Date;
    updated_at: Date;
}

const AccessRuleSchema = new Schema({
    learning_areas: { type: [String], default: [] },
    grade_levels: { type: [Number], default: [] }
}, { _id: false });

const UserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // Allow null values but enforce uniqueness when present
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        access_rules: {
            type: [AccessRuleSchema],
            default: [],
        },
        access_rules_version: {
            type: Number,
            default: 1,
        },
        is_admin_access: {
            type: Boolean,
            default: false,
        },
        evaluator_id: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['Administrator', 'Facilitator', 'Evaluator'],
            default: 'Facilitator',
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export default mongoose.model<IUser>('User', UserSchema);
