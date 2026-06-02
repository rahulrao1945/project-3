import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, Phone, CheckCircle2, User, AlertCircle, Info, Cpu } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  // Socket state
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Inbox & Conversation states
  const [inbox, setInbox] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // active inbox channel object
  const [messages, setMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [loadingInbox, setLoadingInbox] = useState(true);

  // Auto-initiate message query params (from product details contact drawer)
  const queryParams = new URLSearchParams(location.search);
  const targetUserParam = queryParams.get('user');
  const autoMsgParam = queryParams.get('message');

  // 1. Initialize Socket.io Connection
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(API_BASE_URL);

    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected:', socketRef.current.id);
    });

    // Listen for incoming messages
    socketRef.current.on('receive_message', (newMsg) => {
      // If the incoming message belongs to the active chat room, append it!
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });

      // Update last message in inbox list dynamically
      setInbox((prevInbox) =>
        prevInbox.map((ch) =>
          ch.roomId === newMsg.roomId
            ? { ...ch, lastMessage: newMsg.content, timestamp: newMsg.timestamp }
            : ch
        )
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 WebSocket disconnected');
      }
    };
  }, [user]);

  // 2. Fetch Inbox channels
  const fetchInbox = async (selectTargetId = null) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/chat/inbox`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      
      setInbox(data);
      setLoadingInbox(false);

      // Handle selecting a specific inbox thread if requested or default to first
      if (data.length > 0) {
        if (selectTargetId) {
          const matched = data.find(ch => ch.otherParticipant._id === selectTargetId);
          if (matched) {
            handleSelectChat(matched);
          } else {
            // Recipient not in inbox yet (First-time chat initiation!)
            fetchNewParticipantDetails(selectTargetId);
          }
        } else if (!activeChat) {
          handleSelectChat(data[0]);
        }
      } else if (selectTargetId) {
        // Empty inbox but user clicked "Chat with Seller"
        fetchNewParticipantDetails(selectTargetId);
      }
    } catch (err) {
      console.error('Error fetching inbox:', err);
      setLoadingInbox(false);
    }
  };

  // Look up other participant details to pre-populate mock inbox thread
  const fetchNewParticipantDetails = async (otherId) => {
    try {
      const res = await fetch(`${API_BASE}/products?status=All`);
      const productsList = await res.json();
      
      // Find any product listed by this seller to parse sellerName, or fetch user profile
      const matchingProduct = productsList.find(p => p.seller === otherId);
      
      let otherName = 'Campus Student';
      let otherEmail = 'student@college.edu';
      let otherAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${otherId}`;
      let otherContact = { phone: '', whatsapp: '', telegram: '' };

      if (matchingProduct) {
        otherName = matchingProduct.sellerName;
        otherEmail = matchingProduct.sellerEmail;
        otherAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${otherName}`;
      }

      const computedRoomId = [user._id, otherId].sort().join('-');
      const mockChannel = {
        roomId: computedRoomId,
        lastMessage: 'Tap to send your first message...',
        timestamp: new Date().toISOString(),
        otherParticipant: {
          _id: otherId,
          name: otherName,
          email: otherEmail,
          avatar: otherAvatar,
          contactInfo: otherContact
        }
      };

      // Add to inbox state locally and select it
      setInbox((prev) => [mockChannel, ...prev]);
      handleSelectChat(mockChannel);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInbox(targetUserParam);
  }, [user, targetUserParam]);

  // 3. Selection handler for Chat Rooms
  const handleSelectChat = (channel) => {
    setActiveChat(channel);
    setMessages([]);
    
    // Join socket room
    if (socketRef.current) {
      socketRef.current.emit('join_room', {
        roomId: channel.roomId,
        username: user.name
      });
    }

    // Load message history from DB
    fetch(`${API_BASE}/chat/history/${channel.roomId}`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      })
      .catch(err => console.error('Error fetching messages:', err));
  };

  // Scroll to bottom helper on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle auto-message dispatch on load
  useEffect(() => {
    if (activeChat && autoMsgParam && socketRef.current) {
      // Dispatches the message automatically
      setTypedMessage(autoMsgParam);
      // Clean query path so refreshing doesn't keep sending auto message
      navigate('/chat', { replace: true });
    }
  }, [activeChat, autoMsgParam]);

  // 4. Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (typedMessage.trim() === '' || !activeChat || !socketRef.current) return;

    const messagePayload = {
      sender: user._id,
      receiver: activeChat.otherParticipant._id,
      senderName: user.name,
      receiverName: activeChat.otherParticipant.name,
      content: typedMessage.trim(),
      roomId: activeChat.roomId
    };

    // Dispatch via Socket
    socketRef.current.emit('send_message', messagePayload);
    setTypedMessage('');
  };

  if (!user) return null;

  return (
    <div className="flex-grow min-h-[85vh] grid grid-cols-1 md:grid-cols-4 max-w-7xl mx-auto w-full border-t border-slate-200/50 dark:border-slate-800/80">
      
      {/* 👤 Left Column: Inbox List */}
      <aside className="md:col-span-1 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center space-x-1.5 text-base">
            <MessageSquare className="h-4.5 w-4.5 text-emerald-500" />
            <span>Conversations</span>
          </h3>
        </div>

        {loadingInbox ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-12 bg-slate-100 dark:bg-slate-900 rounded-lg" />
            ))}
          </div>
        ) : inbox.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-semibold space-y-1">
            <p>💬 No messages traded yet.</p>
            <p>Go to catalog and click 'Chat with Seller' to swap hardware!</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900 pr-1">
            {inbox.map((ch) => {
              const isActive = activeChat?.roomId === ch.roomId;
              return (
                <button
                  key={ch.roomId}
                  onClick={() => handleSelectChat(ch)}
                  className={`w-full p-4 text-left transition-colors duration-200 flex items-center space-x-3 focus:outline-none ${
                    isActive 
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/5 border-l-4 border-emerald-500' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <img
                    src={ch.otherParticipant.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${ch.otherParticipant.name}`}
                    alt={ch.otherParticipant.name}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-900"
                  />
                  <div className="flex-grow min-w-0">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 block truncate leading-tight">
                      {ch.otherParticipant.name}
                    </span>
                    <span className="text-xs text-slate-400 block truncate mt-1">
                      {ch.lastMessage}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      {/* ✉️ Right Column: Live Message Feed */}
      <main className="md:col-span-3 flex flex-col h-full bg-slate-50 dark:bg-slate-950/20">
        {activeChat ? (
          <>
            {/* Top Workspace Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <img
                  src={activeChat.otherParticipant.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeChat.otherParticipant.name}`}
                  alt={activeChat.otherParticipant.name}
                  className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-900"
                />
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-white leading-tight text-sm">
                    {activeChat.otherParticipant.name}
                  </h4>
                  <span className="text-xs text-slate-400">{activeChat.otherParticipant.email}</span>
                </div>
              </div>

              {/* Call seller if dial phone is ready */}
              {activeChat.otherParticipant.contactInfo?.phone && (
                <a
                  href={`tel:${activeChat.otherParticipant.contactInfo.phone}`}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-emerald-400 transition-colors"
                  title={`Call ${activeChat.otherParticipant.name}`}
                >
                  <Phone className="h-4.5 w-4.5" />
                </a>
              )}
            </div>

            {/* Bubble Message Stream */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4 max-h-[50vh] min-h-[40vh]">
              
              <div className="flex items-center justify-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 max-w-sm mx-auto text-center">
                <Info className="h-3.5 w-3.5 mr-1" />
                <span>Encrypted Campus Hand-to-Hand Deal Room</span>
              </div>

              {messages.map((msg) => {
                const isMyMessage = msg.sender === user._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-xl text-sm leading-relaxed shadow ${
                        isMyMessage
                          ? 'bg-emerald-500 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                      <span className={`block text-[9px] text-right mt-1.5 uppercase font-bold tracking-wider ${
                        isMyMessage ? 'text-white/70' : 'text-slate-400'
                      }`}>
                        {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 flex items-center space-x-3 shadow"
            >
              <input
                type="text"
                placeholder={`Type message to ${activeChat.otherParticipant.name}...`}
                className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/40 text-slate-800 dark:text-white placeholder-slate-400"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold shadow-md transition-transform active:scale-95 flex items-center justify-center"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-16 w-16 text-slate-300 dark:text-slate-800 mb-3 animate-bounce-slow" />
            <h4 className="font-extrabold text-lg text-slate-700 dark:text-slate-300">Deals Mailroom</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select an ongoing conversation thread from the sidebar or click "Chat with Seller" in listings to begin trading used parts!
            </p>
          </div>
        )}
      </main>

    </div>
  );
}
