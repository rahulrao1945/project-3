import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get chat history for a specific roomId
// @route   GET /api/chat/history/:roomId
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Ensure requesting user is part of the room ID
    const userId = req.user._id.toString();
    if (!roomId.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to view this room history' });
    }

    const messages = await Message.find({ roomId });
    // Sort by chronological order
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error loading messages', error: error.message });
  }
};

// @desc    Get all active chats (inbox) for a user
// @route   GET /api/chat/inbox
// @access  Private
export const getUserInbox = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Fetch all messages involving the active student
    const allMessages = await Message.find({});
    const userMessages = allMessages.filter(m => m.sender === userId || m.receiver === userId);

    // Group messages by roomId
    const roomGroups = {};
    for (const msg of userMessages) {
      if (!roomGroups[msg.roomId]) {
        roomGroups[msg.roomId] = [];
      }
      roomGroups[msg.roomId].push(msg);
    }

    const inbox = [];

    // For each room, parse details
    for (const roomId in roomGroups) {
      const messagesings = roomGroups[roomId];
      // Sort to get latest message
      messagesings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const latestMessage = messagesings[0];

      // Figure out who the other participant is
      const otherParticipantId = latestMessage.sender === userId 
        ? latestMessage.receiver 
        : latestMessage.sender;

      const otherUser = await User.findById(otherParticipantId);

      inbox.push({
        roomId,
        lastMessage: latestMessage.content,
        timestamp: latestMessage.timestamp,
        otherParticipant: otherUser ? {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          avatar: otherUser.avatar,
          contactInfo: otherUser.contactInfo
        } : {
          _id: otherParticipantId,
          name: 'Campus Student',
          email: 'student@college.edu',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${otherParticipantId}`,
          contactInfo: { phone: '', whatsapp: '', telegram: '' }
        }
      });
    }

    // Sort inbox by newest message timestamp
    inbox.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(inbox);
  } catch (error) {
    console.error('Get user inbox error:', error);
    res.status(500).json({ message: 'Server error loading inbox', error: error.message });
  }
};
