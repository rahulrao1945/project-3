import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Configuration & DB initialization
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Models for live message logging
import Message from './models/Message.js';

// Load environmental parameters
dotenv.config();

// Connect to Database (with zero-configuration local fallback)
connectDB();

const app = express();
const server = http.createServer(app);

// Bind Socket.io for premium real-time communications
const io = new Server(server, {
  cors: {
    origin: '*', // Allow any origin for development comfort
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure public uploads exists and serve static files
const publicDir = path.resolve('public');
const uploadDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: global.isLocalDB ? 'Local Development DB' : 'MongoDB Atlas Connected',
    time: new Date().toISOString()
  });
});

// REST Endpoints Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io WebSocket Core Engine
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSocket server: ${socket.id}`);

  // When a student opens a conversation thread, they join a custom room
  socket.on('join_room', (data) => {
    const { roomId, username } = data;
    socket.join(roomId);
    console.log(`💬 User [${username}] joined chat room: [${roomId}]`);
  });

  // When a student sends a message
  socket.on('send_message', async (data) => {
    try {
      const { sender, receiver, senderName, receiverName, content, roomId } = data;

      if (!sender || !receiver || !content || !roomId) {
        console.error('⚠️ Incomplete message packet received:', data);
        return;
      }

      // Log message to database (works in both Mongo and Local JSON fallback modes)
      const savedMsg = await Message.create({
        sender,
        receiver,
        senderName: senderName || 'Student',
        receiverName: receiverName || 'Student',
        content,
        roomId,
        timestamp: new Date()
      });

      // Broadcast the message immediately to all clients in the room
      io.to(roomId).emit('receive_message', savedMsg);
      console.log(`✉️ Message sent from [${senderName}] to [${receiverName}] inside room [${roomId}]`);
    } catch (err) {
      console.error('❌ Socket message logging error:', err);
    }
  });

  // Optional: User typing indicator triggers
  socket.on('typing', (data) => {
    const { roomId, username, isTyping } = data;
    socket.to(roomId).emit('user_typing', { username, isTyping });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Fallback to React Frontend in Production
const __dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('🏫 Campus Components Marketplace API is running...');
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Campus Marketplace Server running on http://localhost:${PORT}`);
  console.log(`📊 Mode: ${global.isLocalDB ? '📁 local_db.json File Database' : '🌐 Connected MongoDB'}`);
});
