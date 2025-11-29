import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatService, Conversation, Message, ChatUser } from '../../services/chatService';
import { ChatIcon, SendIcon, UserIcon, UsersIcon, CloseIcon, SearchIcon } from './ChatIcons';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: {
        _id: string;
        name: string;
        is_admin_access?: boolean;
        evaluator_id?: string;
    };
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, currentUser }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewChat, setShowNewChat] = useState(false);
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [showBroadcast, setShowBroadcast] = useState(false);
    const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'evaluators' | 'admins'>('all');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = useCallback(async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    }, []);

    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const data = await chatService.getMessages(conversationId);
            setMessages(data);
            await chatService.markAsRead(conversationId);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchConversations();
            // Poll for new messages every 5 seconds
            pollIntervalRef.current = setInterval(() => {
                fetchConversations();
                if (selectedConversation) {
                    fetchMessages(selectedConversation.conversation_id);
                }
            }, 5000);
        }
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [isOpen, fetchConversations, fetchMessages, selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setShowNewChat(false);
        setShowBroadcast(false);
        setLoading(true);
        await fetchMessages(conversation.conversation_id);
        setLoading(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            if (showBroadcast && currentUser.is_admin_access) {
                await chatService.sendBroadcast(newMessage.trim(), broadcastTarget);
                setShowBroadcast(false);
            } else if (selectedConversation) {
                await chatService.sendToConversation(selectedConversation.conversation_id, newMessage.trim());
                await fetchMessages(selectedConversation.conversation_id);
            }
            setNewMessage('');
            fetchConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleStartNewChat = async (user: ChatUser) => {
        try {
            // Send initial message to create conversation
            const message = await chatService.sendMessage(user._id, `Started a conversation`);
            await fetchConversations();
            
            // Find and select the new conversation
            const newConv = conversations.find(c => c.conversation_id === message.conversation_id);
            if (newConv) {
                handleSelectConversation(newConv);
            } else {
                // Refetch and try again
                const updatedConvs = await chatService.getConversations();
                setConversations(updatedConvs);
                const foundConv = updatedConvs.find(c => c.conversation_id === message.conversation_id);
                if (foundConv) {
                    handleSelectConversation(foundConv);
                }
            }
            setShowNewChat(false);
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    const fetchUsers = useCallback(async () => {
        try {
            const data = await chatService.getUsers(userSearch);
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }, [userSearch]);

    useEffect(() => {
        if (showNewChat) {
            fetchUsers();
        }
    }, [showNewChat, fetchUsers]);

    const getOtherParticipantName = (conversation: Conversation): string => {
        if (conversation.conversation_type === 'broadcast') {
            return conversation.title || 'Broadcast';
        }
        const otherName = conversation.participant_names.find(name => name !== currentUser.name);
        return otherName || 'Unknown';
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-700',
            evaluator: 'bg-blue-100 text-blue-700',
            user: 'bg-gray-100 text-gray-700',
        };
        return colors[role as keyof typeof colors] || colors.user;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowNewChat(true); setShowBroadcast(false); setSelectedConversation(null); }}
                                className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                New Chat
                            </button>
                            {currentUser.is_admin_access && (
                                <button
                                    onClick={() => { setShowBroadcast(true); setShowNewChat(false); setSelectedConversation(null); }}
                                    className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Broadcast
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No conversations yet
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv._id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedConversation?.conversation_id === conv.conversation_id ? 'bg-primary-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            conv.conversation_type === 'broadcast' ? 'bg-purple-100' : 'bg-primary-100'
                                        }`}>
                                            {conv.conversation_type === 'broadcast' ? (
                                                <UsersIcon className="w-5 h-5 text-purple-600" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-primary-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-800 truncate">
                                                    {getOtherParticipantName(conv)}
                                                </span>
                                                {conv.unread_count && conv.unread_count > 0 && (
                                                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.last_message && (
                                                <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {showNewChat ? (
                        /* New Chat View */
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-3">Start New Conversation</h3>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {users.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => handleStartNewChat(user)}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{user.name}</div>
                                            <div className="text-sm text-gray-500">@{user.username}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : showBroadcast ? (
                        /* Broadcast View */
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">Send Broadcast Message</h3>
                                <p className="text-sm text-gray-500">Send a message to multiple users at once</p>
                            </div>
                            <div className="p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                <select
                                    value={broadcastTarget}
                                    onChange={(e) => setBroadcastTarget(e.target.value as 'all' | 'evaluators' | 'admins')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="all">All Users</option>
                                    <option value="evaluators">Evaluators Only</option>
                                    <option value="admins">Admins Only</option>
                                </select>
                            </div>
                            <div className="flex-1" />
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your broadcast message..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <SendIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : selectedConversation ? (
                        /* Messages View */
                        <>
                            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    selectedConversation.conversation_type === 'broadcast' ? 'bg-purple-100' : 'bg-primary-100'
                                }`}>
                                    {selectedConversation.conversation_type === 'broadcast' ? (
                                        <UsersIcon className="w-5 h-5 text-purple-600" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-primary-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        {getOtherParticipantName(selectedConversation)}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedConversation.conversation_type === 'broadcast' 
                                            ? `${selectedConversation.participants.length} recipients`
                                            : 'Direct message'}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-gray-500">No messages yet</div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg._id}
                                            className={`flex ${msg.sender_id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${
                                                msg.sender_id === currentUser._id 
                                                    ? 'bg-primary-600 text-white' 
                                                    : 'bg-gray-100 text-gray-800'
                                            } rounded-lg px-4 py-2`}>
                                                {msg.sender_id !== currentUser._id && (
                                                    <div className="text-xs font-medium mb-1 opacity-75">
                                                        {msg.sender_name}
                                                    </div>
                                                )}
                                                <p className="break-words">{msg.content}</p>
                                                <div className={`text-xs mt-1 ${
                                                    msg.sender_id === currentUser._id ? 'text-primary-200' : 'text-gray-400'
                                                }`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <SendIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <ChatIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
                                <p className="text-gray-400">or start a new chat</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
