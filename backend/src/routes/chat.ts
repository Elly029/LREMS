import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import User from '../models/User';
import { protect } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper to generate conversation ID for direct messages
const generateDirectConversationId = (userId1: string, userId2: string): string => {
    const sorted = [userId1, userId2].sort();
    return `direct_${sorted[0]}_${sorted[1]}`;
};

// Helper to determine user role
const getUserRole = (user: any): 'admin' | 'evaluator' | 'user' => {
    if (user.is_admin_access) return 'admin';
    if (user.evaluator_id) return 'evaluator';
    return 'user';
};

// @route   GET /api/chat/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/conversations', protect, async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        const conversations = await Conversation.find({
            participants: userId
        })
            .sort({ last_message_at: -1, created_at: -1 })
            .lean();

        // Get unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversation_id: conv.conversation_id,
                    sender_id: { $ne: userId },
                    read_by: { $ne: userId }
                });
                return { ...conv, unread_count: unreadCount };
            })
        );

        res.json(conversationsWithUnread);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

// @route   GET /api/chat/conversations/:conversationId/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:conversationId/messages', protect, async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id;
        const { limit = 50, before } = req.query;

        // Verify user is participant
        const conversation = await Conversation.findOne({
            conversation_id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        let query: any = { conversation_id: conversationId };
        if (before) {
            query.created_at = { $lt: new Date(before as string) };
        }

        const messages = await Message.find(query)
            .sort({ created_at: -1 })
            .limit(Number(limit))
            .lean();

        // Mark messages as read
        await Message.updateMany(
            {
                conversation_id: conversationId,
                sender_id: { $ne: userId },
                read_by: { $ne: userId }
            },
            { $addToSet: { read_by: userId } }
        );

        res.json(messages.reverse());
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// @route   POST /api/chat/messages
// @desc    Send a message
// @access  Private
router.post('/messages', protect, async (req: Request, res: Response) => {
    try {
        const { recipient_id, content, conversation_id: existingConvId } = req.body;
        const sender = req.user;

        if (!sender) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        if (!recipient_id && !existingConvId) {
            return res.status(400).json({ message: 'Recipient or conversation ID is required' });
        }

        let conversation;
        let conversationId = existingConvId;

        if (recipient_id && !existingConvId) {
            // Direct message - find or create conversation
            conversationId = generateDirectConversationId(sender._id.toString(), recipient_id);

            conversation = await Conversation.findOne({ conversation_id: conversationId });

            if (!conversation) {
                const recipient = await User.findById(recipient_id);
                if (!recipient) {
                    return res.status(404).json({ message: 'Recipient not found' });
                }

                conversation = new Conversation({
                    conversation_id: conversationId,
                    participants: [sender._id, recipient._id],
                    participant_names: [sender.name, recipient.name],
                    conversation_type: 'direct',
                    created_by: sender._id,
                });
                await conversation.save();
            }
        } else {
            conversation = await Conversation.findOne({
                conversation_id: conversationId,
                participants: sender._id
            });

            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
        }

        // Get recipient info for direct messages
        let recipientName = null;
        if (conversation.conversation_type === 'direct') {
            const recipientId = conversation.participants.find(
                (p: mongoose.Types.ObjectId) => p.toString() !== sender._id.toString()
            );
            const recipient = await User.findById(recipientId);
            recipientName = recipient?.name;
        }

        const message = new Message({
            sender_id: sender._id,
            sender_name: sender.name,
            sender_role: getUserRole(sender),
            recipient_id: recipient_id || null,
            recipient_name: recipientName,
            conversation_id: conversationId,
            message_type: conversation.conversation_type,
            content: content.trim(),
            read_by: [sender._id],
        });

        await message.save();

        // Update conversation
        conversation.last_message = content.substring(0, 100);
        conversation.last_message_at = new Date();
        await conversation.save();

        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// @route   POST /api/chat/broadcast
// @desc    Send broadcast message (Admin only)
// @access  Private/Admin
router.post('/broadcast', protect, async (req: Request, res: Response) => {
    try {
        const sender = req.user;

        if (!sender?.is_admin_access) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { content, target_role } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Find target users
        let targetQuery: any = {};
        if (target_role === 'evaluators') {
            targetQuery.evaluator_id = { $ne: null };
        } else if (target_role === 'admins') {
            targetQuery.is_admin_access = true;
        }
        // 'all' means no filter

        const targetUsers = await User.find(targetQuery).select('_id name');

        if (targetUsers.length === 0) {
            return res.status(400).json({ message: 'No recipients found' });
        }

        const conversationId = `broadcast_${uuidv4()}`;
        const participantIds = [sender._id, ...targetUsers.map(u => u._id)];
        const participantNames = [sender.name, ...targetUsers.map(u => u.name)];

        // Create broadcast conversation
        const conversation = new Conversation({
            conversation_id: conversationId,
            participants: participantIds,
            participant_names: participantNames,
            conversation_type: 'broadcast',
            title: `Broadcast from ${sender.name}`,
            created_by: sender._id,
            last_message: content.substring(0, 100),
            last_message_at: new Date(),
        });
        await conversation.save();

        // Create message
        const message = new Message({
            sender_id: sender._id,
            sender_name: sender.name,
            sender_role: 'admin',
            conversation_id: conversationId,
            message_type: 'broadcast',
            content: content.trim(),
            read_by: [sender._id],
        });
        await message.save();

        res.status(201).json({
            message: 'Broadcast sent successfully',
            recipients_count: targetUsers.length,
            conversation_id: conversationId
        });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        res.status(500).json({ message: 'Failed to send broadcast' });
    }
});

// @route   GET /api/chat/users
// @desc    Get users available for chat
// @access  Private
router.get('/users', protect, async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user?._id;
        const { search } = req.query;

        let query: any = { _id: { $ne: currentUserId } };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('_id username name is_admin_access evaluator_id')
            .limit(50)
            .lean();

        const usersWithRole = users.map(user => ({
            ...user,
            role: user.is_admin_access ? 'admin' : (user.evaluator_id ? 'evaluator' : 'user')
        }));

        res.json(usersWithRole);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// @route   GET /api/chat/unread-count
// @desc    Get total unread message count
// @access  Private
router.get('/unread-count', protect, async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        // Get conversations user is part of
        const conversations = await Conversation.find({ participants: userId });
        const conversationIds = conversations.map(c => c.conversation_id);

        const unreadCount = await Message.countDocuments({
            conversation_id: { $in: conversationIds },
            sender_id: { $ne: userId },
            read_by: { $ne: userId }
        });

        res.json({ unread_count: unreadCount });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Failed to fetch unread count' });
    }
});

// @route   PUT /api/chat/conversations/:conversationId/read
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversations/:conversationId/read', protect, async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user?._id;

        await Message.updateMany(
            {
                conversation_id: conversationId,
                sender_id: { $ne: userId },
                read_by: { $ne: userId }
            },
            { $addToSet: { read_by: userId } }
        );

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
});

export default router;
