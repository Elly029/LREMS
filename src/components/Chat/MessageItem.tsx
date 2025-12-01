import React from 'react';
import { Message } from '../../services/chatService';

interface MessageItemProps {
    message: Message;
    isOwnMessage: boolean;
    getRoleBadge: (role: string) => string;
}

const MessageItemComponent: React.FC<MessageItemProps> = ({ message, isOwnMessage, getRoleBadge }) => {
    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isOwnMessage && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">{message.sender_name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadge(message.sender_role)}`}>
                            {message.sender_role}
                        </span>
                    </div>
                )}
                <div className={`px-4 py-2 rounded-2xl ${isOwnMessage
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <span className="text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export const MessageItem = React.memo(MessageItemComponent, (prev, next) => {
    return (
        prev.isOwnMessage === next.isOwnMessage &&
        prev.message._id === next.message._id &&
        prev.message.content === next.message.content &&
        prev.message.created_at === next.message.created_at &&
        prev.message.sender_role === next.message.sender_role
    );
});

