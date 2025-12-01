import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/chatService';
import { ChatIcon } from './ChatIcons';

interface ChatButtonProps {
    onClick: () => void;
}

export const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { unread_count } = await chatService.getUnreadCount();
                setUnreadCount(unread_count);
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };

        const startPolling = () => {
            if (intervalRef.current != null) return;
            intervalRef.current = window.setInterval(fetchUnreadCount, 30000);
        };
        const stopPolling = () => {
            if (intervalRef.current != null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        fetchUnreadCount();
        if (document.visibilityState === 'visible') {
            startPolling();
        }

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                startPolling();
            } else {
                stopPolling();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            stopPolling();
        };
    }, []);

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center z-40 hover:scale-105"
            title="Open Chat"
        >
            <ChatIcon className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
};
