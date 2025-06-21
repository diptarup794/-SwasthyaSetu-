const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import AI modules
const { HealthAIAgent } = require('./ai/agents/healthAgent');
const { DiagnosisWorkflow } = require('./ai/workflows/diagnosisWorkflow');
const { TelemedicineAgent } = require('./ai/agents/telemedicineAgent');
const { MedicationAgent } = require('./ai/agents/medicationAgent');
const { PredictiveAnalytics } = require('./ai/analytics/predictiveAnalytics');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const aiRoutes = require('./routes/ai');
const telemedicineRoutes = require('./routes/telemedicine');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize AI Agents
const healthAgent = new HealthAIAgent();
const telemedicineAgent = new TelemedicineAgent();
const medicationAgent = new MedicationAgent();
const predictiveAnalytics = new PredictiveAnalytics();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwasthyaSetu AI Healthcare Platform',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', authenticateToken, patientRoutes);
app.use('/api/doctors', authenticateToken, doctorRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/telemedicine', authenticateToken, telemedicineRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// AI Chat Endpoint
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context, userId } = req.body;
    
    // Route to appropriate AI agent based on context
    let response;
    switch (context) {
      case 'diagnosis':
        response = await healthAgent.processDiagnosis(message, userId);
        break;
      case 'medication':
        response = await medicationAgent.processMedicationQuery(message, userId);
        break;
      case 'telemedicine':
        response = await telemedicineAgent.processTelemedicineRequest(message, userId);
        break;
      default:
        response = await healthAgent.processGeneralQuery(message, userId);
    }
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: 'AI processing failed' });
  }
});

// Real-time health monitoring
app.post('/api/health-monitor', authenticateToken, async (req, res) => {
  try {
    const { vitalSigns, symptoms, userId } = req.body;
    
    // Process with predictive analytics
    const analysis = await predictiveAnalytics.analyzeVitalSigns(vitalSigns, symptoms, userId);
    
    // Emit real-time updates to connected clients
    io.to(userId).emit('healthUpdate', analysis);
    
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Health monitoring error:', error);
    res.status(500).json({ success: false, error: 'Health monitoring failed' });
  }
});

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
  
  // Handle telemedicine calls
  socket.on('joinCall', (callId) => {
    socket.join(callId);
    socket.to(callId).emit('userJoined', socket.id);
  });
  
  // Handle video/audio streams
  socket.on('stream', (data) => {
    socket.to(data.callId).emit('stream', data);
  });
  
  // Handle chat messages
  socket.on('chatMessage', (data) => {
    socket.to(data.roomId).emit('chatMessage', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 SwasthyaSetu AI Healthcare Platform running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Agents initialized and ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io }; 