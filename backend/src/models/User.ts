
import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessRule {
    learning_areas: string[]; // Use ["*"] for all
    grade_levels: number[];   // Use [] for all
}

export interface IUser extends Document {
    username: string;
    password: string; // Hashed
    name: string;
    access_rules: IAccessRule[];
    is_admin_access?: boolean;
    evaluator_id?: string; // Link to Evaluator profile
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
        is_admin_access: {
            type: Boolean,
            default: false,
        },
        evaluator_id: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

export default mongoose.model<IUser>('User', UserSchema);
