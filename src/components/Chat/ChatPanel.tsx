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

type ViewMode = 'conversations' | 'new-chat' | 'new-group' | 'broadcast' | 'messages';

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, currentUser }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('conversations');
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'evaluators' | 'admins'>('all');
    
    // Group chat state
    const [groupName, setGroupName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([]);
    
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
        setViewMode('messages');
        setLoading(true);
        await fetchMessages(conversation.conversation_id);
        setLoading(false);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            if (viewMode === 'broadcast' && currentUser.is_admin_access) {
                await chatService.sendBroadcast(newMessage.trim(), broadcastTarget);
                setViewMode('conversations');
                setNewMessage('');
                fetchConversations();
            } else if (selectedConversation) {
                await chatService.sendToConversation(selectedConversation.conversation_id, newMessage.trim());
                await fetchMessages(selectedConversation.conversation_id);
                setNewMessage('');
                fetchConversations();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleStartNewChat = async (user: ChatUser) => {
        try {
            const message = await chatService.sendMessage(user._id, `Started a conversation`);
            await fetchConversations();
            const updatedConvs = await chatService.getConversations();
            setConversations(updatedConvs);
            const foundConv = updatedConvs.find(c => c.conversation_id === message.conversation_id);
            if (foundConv) {
                handleSelectConversation(foundConv);
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        
        try {
            const result = await chatService.createGroup(
                groupName.trim(),
                selectedUsers.map(u => u._id)
            );
            await fetchConversations();
            const updatedConvs = await chatService.getConversations();
            const foundConv = updatedConvs.find(c => c.conversation_id === result.conversation_id);
            if (foundConv) {
                handleSelectConversation(foundConv);
            }
            setGroupName('');
            setSelectedUsers([]);
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    const toggleUserSelection = (user: ChatUser) => {
        setSelectedUsers(prev => {
            const exists = prev.find(u => u._id === user._id);
            if (exists) {
                return prev.filter(u => u._id !== user._id);
            }
            return [...prev, user];
        });
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
        if (viewMode === 'new-chat' || viewMode === 'new-group') {
            fetchUsers();
        }
    }, [viewMode, fetchUsers]);

    const getConversationDisplayName = (conversation: Conversation): string => {
        if (conversation.conversation_type === 'broadcast') {
            return conversation.title || 'Broadcast';
        }
        if (conversation.conversation_type === 'group') {
            return conversation.title || 'Group Chat';
        }
        const otherName = conversation.participant_names.find(name => name !== currentUser.name);
        return otherName || 'Unknown';
    };

    const getConversationIcon = (conversation: Conversation) => {
        if (conversation.conversation_type === 'broadcast') {
            return <UsersIcon className="w-5 h-5 text-purple-600" />;
        }
        if (conversation.conversation_type === 'group') {
            return <UsersIcon className="w-5 h-5 text-green-600" />;
        }
        return <UserIcon className="w-5 h-5 text-primary-600" />;
    };

    const getConversationBgColor = (conversation: Conversation) => {
        if (conversation.conversation_type === 'broadcast') return 'bg-purple-100';
        if (conversation.conversation_type === 'group') return 'bg-green-100';
        return 'bg-primary-100';
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700',
            evaluator: 'bg-blue-100 text-blue-700',
            user: 'bg-gray-100 text-gray-700',
        };
        return colors[role] || colors.user;
    };

    const resetView = () => {
        setViewMode('conversations');
        setSelectedConversation(null);
        setSelectedUsers([]);
        setGroupName('');
        setUserSearch('');
    };

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] max-h-[700px] flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                    {/* Header */}
                    <div className="p-4 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                            <button 
                                onClick={onClose} 
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setViewMode('new-chat'); setSelectedConversation(null); }}
                                    className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        viewMode === 'new-chat' 
                                            ? 'bg-primary-600 text-white' 
                                            : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                    }`}
                                >
                                    New Chat
                                </button>
                                <button
                                    onClick={() => { setViewMode('new-group'); setSelectedConversation(null); setSelectedUsers([]); }}
                                    className={`flex-1 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        viewMode === 'new-group' 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                                >
                                    New Group
                                </button>
                            </div>
                            {currentUser.is_admin_access && (
                                <button
                                    onClick={() => { setViewMode('broadcast'); setSelectedConversation(null); }}
                                    className={`w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        viewMode === 'broadcast' 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                    }`}
                                >
                                    📢 Broadcast Message
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center">
                                <ChatIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No conversations yet</p>
                                <p className="text-gray-400 text-xs mt-1">Start a new chat to begin messaging</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv._id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`p-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${
                                        selectedConversation?.conversation_id === conv.conversation_id 
                                            ? 'bg-white border-l-4 border-l-primary-500' 
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${getConversationBgColor(conv)}`}>
                                            {getConversationIcon(conv)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-semibold text-gray-800 truncate">
                                                    {getConversationDisplayName(conv)}
                                                </span>
                                                {conv.unread_count && conv.unread_count > 0 && (
                                                    <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.last_message && (
                                                <p className="text-sm text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                                            )}
                                            {conv.conversation_type !== 'direct' && (
                                                <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${
                                                    conv.conversation_type === 'broadcast' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                                                }`}>
                                                    {conv.conversation_type === 'broadcast' ? 'Broadcast' : 'Group'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
