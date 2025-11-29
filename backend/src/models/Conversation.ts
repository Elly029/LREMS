import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    conversation_id: string;
    participants: mongoose.Types.ObjectId[];
    participant_names: string[];
    conversation_type: 'direct' | 'broadcast' | 'group';
    title?: string; // For group/broadcast conversations
    last_message?: string;
    last_message_at?: Date;
    created_by: mongoose.Types.ObjectId;
    created_at: Date;
    updated_at: Date;
}

const ConversationSchema: Schema = new Schema(
    {
        conversation_id: {
            type: String,
            required: true,
            unique: true,
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        participant_names: [{
            type: String,
        }],
        conversation_type: {
            type: String,
            enum: ['direct', 'broadcast', 'group'],
            default: 'direct',
        },
        title: {
            type: String,
            default: null,
        },
        last_message: {
            type: String,
            default: null,
        },
        last_message_at: {
            type: Date,
            default: null,
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Index for efficient querying
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ last_message_at: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
