import { apiClient } from './api';

export interface ChatUser {
    _id: string;
    username: string;
    name: string;
    role: 'admin' | 'evaluator' | 'user';
    is_admin_access?: boolean;
    evaluator_id?: string;
}

export interface Message {
    _id: string;
    sender_id: string;
    sender_name: string;
    sender_role: 'admin' | 'evaluator' | 'user';
    recipient_id?: string;
    recipient_name?: string;
    conversation_id: string;
    message_type: 'direct' | 'broadcast' | 'group';
    content: string;
    read_by: string[];
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    _id: string;
    conversation_id: string;
    participants: string[];
    participant_names: string[];
    conversation_type: 'direct' | 'broadcast' | 'group';
    title?: string;
    last_message?: string;
    last_message_at?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    unread_count?: number;
}

export const chatService = {
    // Get all conversations for current user
    async getConversations(): Promise<Conversation[]> {
        return apiClient.get<Conversation[]>('/chat/conversations');
    },

    // Get messages for a conversation
    async getMessages(conversationId: string, limit = 50, before?: string): Promise<Message[]> {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (before) params.append('before', before);
        return apiClient.get<Message[]>(`/chat/conversations/${conversationId}/messages?${params}`);
    },

    // Send a direct message
    async sendMessage(recipientId: string, content: string): Promise<Message> {
        return apiClient.post<Message>('/chat/messages', {
            recipient_id: recipientId,
            content,
        });
    },

    // Send message to existing conversation
    async sendToConversation(conversationId: string, content: string): Promise<Message> {
        return apiClient.post<Message>('/chat/messages', {
            conversation_id: conversationId,
            content,
        });
    },

    // Send broadcast message (admin only)
    async sendBroadcast(content: string, targetRole: 'all' | 'evaluators' | 'admins'): Promise<{ message: string; recipients_count: number; conversation_id: string }> {
        return apiClient.post('/chat/broadcast', {
            content,
            target_role: targetRole,
        });
    },

    // Get users available for chat
    async getUsers(search?: string): Promise<ChatUser[]> {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return apiClient.get<ChatUser[]>(`/chat/users${params}`);
    },

    // Get unread message count
    async getUnreadCount(): Promise<{ unread_count: number }> {
        return apiClient.get<{ unread_count: number }>('/chat/unread-count');
    },

    // Mark conversation as read
    async markAsRead(conversationId: string): Promise<void> {
        await apiClient.put(`/chat/conversations/${conversationId}/read`, {});
    },

    // Create a group chat
    async createGroup(title: string, participantIds: string[]): Promise<{ message: string; conversation_id: string; participants_count: number; conversation: Conversation }> {
        return apiClient.post('/chat/group', {
            title,
            participant_ids: participantIds,
        });
    },

    // Add participants to a group
    async addGroupParticipants(conversationId: string, participantIds: string[]): Promise<{ message: string; conversation: Conversation }> {
        return apiClient.put(`/chat/group/${conversationId}/participants`, {
            participant_ids: participantIds,
        });
    },
};
