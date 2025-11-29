import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    sender_id: mongoose.Types.ObjectId;
    sender_name: string;
    sender_role: 'admin' | 'evaluator' | 'user';
    recipient_id?: mongoose.Types.ObjectId; // For direct messages
    recipient_name?: string;
    conversation_id: string; // For grouping messages in conversations
    message_type: 'direct' | 'broadcast' | 'group';
    content: string;
    read_by: mongoose.Types.ObjectId[];
    created_at: Date;
    updated_at: Date;
}

const MessageSchema: Schema = new Schema(
    {
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender_name: {
            type: String,
            required: true,
        },
        sender_role: {
            type: String,
            enum: ['admin', 'evaluator', 'user'],
            required: true,
        },
        recipient_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        recipient_name: {
            type: String,
            default: null,
        },
        conversation_id: {
            type: String,
            required: true,
            index: true,
        },
        message_type: {
            type: String,
            enum: ['direct', 'broadcast', 'group'],
            default: 'direct',
        },
        content: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        read_by: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Index for efficient querying
MessageSchema.index({ conversation_id: 1, created_at: -1 });
MessageSchema.index({ sender_id: 1 });
MessageSchema.index({ recipient_id: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
