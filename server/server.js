const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const donationRoutes = require('./routes/donationRoutes');
const requestRoutes = require('./routes/requestRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reportRoutes = require('./routes/reportRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5176'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach socket io to express app
app.set('io', io);

// Express Middlewares
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Online Donation Platform API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Socket.io Real-time handlers
io.on('connection', (socket) => {
  // Join a personal user room for direct notifications
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  // Join a specific donation request discussion
  socket.on('join_chat_room', (requestId) => {
    if (requestId) {
      socket.join(requestId);
    }
  });

  socket.on('leave_chat_room', (requestId) => {
    if (requestId) {
      socket.leave(requestId);
    }
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
