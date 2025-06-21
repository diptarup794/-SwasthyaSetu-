# 🏥 SwasthyaSetu - AI-Powered Healthcare Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)

**SwasthyaSetu** (स्वास्थ्यसेतु) is a state-of-the-art, full-stack AI healthcare platform designed to bridge the gap in healthcare access. Built with cutting-edge AI technologies including LangGraph, AI agents, and predictive analytics, it provides comprehensive healthcare solutions from diagnosis to telemedicine.

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🤖 AI Components](#-ai-components)
- [📊 API Documentation](#-api-documentation)
- [🚀 Deployment](#-deployment)
- [📈 Monitoring](#-monitoring)
- [🔒 Security](#-security)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🆘 Support](#-support)

## 🌟 Features

### 🤖 AI-Powered Healthcare
- **Intelligent Health Agents**: Multi-specialty AI agents for diagnosis, medication, and telemedicine
- **LangGraph Workflows**: Sophisticated healthcare workflows with state management
- **Predictive Analytics**: Real-time health monitoring and risk prediction
- **Natural Language Processing**: Advanced symptom analysis and health queries
- **Google Gemini Integration**: State-of-the-art language model for healthcare conversations

### 💬 Multi-Modal Communication
- **AI Health Chat**: Intelligent conversation with context-aware responses
- **Voice Recognition**: Speech-to-text for hands-free health consultations
- **Image Analysis**: Medical image processing and analysis
- **Real-time Messaging**: Instant communication with healthcare providers
- **Video Conferencing**: High-quality telemedicine sessions

### 📊 Health Monitoring
- **Real-time Vital Signs**: Continuous monitoring of heart rate, blood pressure, temperature
- **Health Trends**: AI-powered trend analysis and pattern recognition
- **Medication Management**: Smart medication reminders and interaction checking
- **Health Score**: Comprehensive health assessment and scoring
- **Predictive Alerts**: Early warning system for health risks

### 🏥 Telemedicine
- **Virtual Consultations**: High-quality video consultations
- **Doctor Matching**: AI-powered doctor-patient matching
- **Session Management**: Complete telemedicine session workflow
- **Follow-up Scheduling**: Automated appointment scheduling
- **Medical Records**: Secure digital health records management

### 📱 Modern UI/UX
- **Responsive Design**: Mobile-first, accessible interface
- **Real-time Updates**: Live health data and notifications
- **Interactive Dashboards**: Beautiful data visualization with Recharts
- **Progressive Web App**: Offline-capable healthcare application
- **Dark/Light Mode**: User preference support

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Docker** & **Docker Compose**
- **MongoDB** (or use Docker)
- **Redis** (or use Docker)
- **OpenAI API Key** or **Google Gemini API Key**

### One-Command Setup
```bash
# Clone the repository
git clone https://github.com/your-username/swasthya-setu.git
cd swasthya-setu

# Make the startup script executable
chmod +x start.sh

# Run the automated setup
./start.sh
```

### Manual Setup
```bash
# 1. Install dependencies
npm run install-all

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start with Docker
docker-compose up -d

# 4. Or start in development mode
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Monitoring**: http://localhost:3001 (Grafana)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Node.js API   │    │   AI Services   │
│                 │◄──►│                 │◄──►│                 │
│ • Health Chat   │    │ • Express.js    │    │ • LangGraph     │
│ • Telemedicine  │    │ • Socket.IO     │    │ • OpenAI/Gemini │
│ • Analytics     │    │ • Authentication│    │ • TensorFlow    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   Redis Cache   │    │   File Storage  │
│                 │    │                 │    │                 │
│ • User Data     │    │ • Sessions      │    │ • Medical Images│
│ • Health Records│    │ • Real-time Data│    │ • Documents     │
│ • Appointments  │    │ • Caching       │    │ • Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Node.js 18+** with Express.js
- **LangGraph** for AI workflows
- **Google Gemini** for natural language processing
- **TensorFlow.js** for machine learning
- **Socket.IO** for real-time communication
- **MongoDB** for data persistence
- **Redis** for caching and sessions
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for media storage

### Frontend
- **React 18** with modern hooks
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Query** for state management
- **Socket.IO Client** for real-time updates
- **React Router** for navigation
- **React Hook Form** for forms
- **Lucide React** for icons

### AI & ML
- **LangChain** for AI agent orchestration
- **Google Generative AI** for advanced language models
- **TensorFlow.js** for client-side ML
- **Natural** for NLP processing
- **Custom AI Agents** for healthcare workflows

### DevOps & Monitoring
- **Docker** & **Docker Compose**
- **Nginx** reverse proxy
- **Prometheus** for metrics
- **Grafana** for visualization
- **ELK Stack** for logging
- **Health checks** and monitoring

## 📦 Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/swasthya-setu.git
cd swasthya-setu
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### Step 3: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### Step 4: Database Setup
```bash
# Start MongoDB and Redis with Docker
docker-compose up -d mongo redis

# Or install locally
# MongoDB: https://docs.mongodb.com/manual/installation/
# Redis: https://redis.io/download
```

### Step 5: Start Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start

# Docker mode
docker-compose up -d
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/swasthya-setu
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Communication
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Payment
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
```

### Docker Configuration
The `docker-compose.yml` includes:
- **API Server**: Node.js backend
- **Client**: React frontend
- **MongoDB**: Database
- **Redis**: Cache
- **Nginx**: Reverse proxy
- **Prometheus**: Metrics
- **Grafana**: Visualization
- **ELK Stack**: Logging

## 🤖 AI Components

### Health AI Agent (`ai/agents/healthAgent.js`)
- **Symptom Analysis**: Intelligent symptom extraction and analysis
- **Diagnosis Support**: AI-powered diagnostic assistance
- **Health Recommendations**: Personalized health advice
- **Trend Analysis**: Long-term health pattern recognition

### Telemedicine Agent (`ai/agents/telemedicineAgent.js`)
- **Patient Assessment**: Pre-consultation patient evaluation
- **Doctor Matching**: AI-powered doctor-patient matching
- **Session Management**: Complete telemedicine workflow
- **Follow-up Care**: Automated post-consultation care

### Medication Agent (`ai/agents/medicationAgent.js`)
- **Drug Interactions**: Comprehensive interaction checking
- **Dosage Calculation**: AI-powered dosage recommendations
- **Adherence Monitoring**: Medication compliance tracking
- **Side Effect Analysis**: Adverse reaction monitoring

### Predictive Analytics (`ai/analytics/predictiveAnalytics.js`)
- **Health Risk Assessment**: Predictive health risk analysis
- **Disease Prediction**: AI-powered disease risk prediction
- **Treatment Outcome**: Treatment outcome forecasting
- **Preventive Care**: Proactive health recommendations

## 📊 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
```

### Patient Endpoints
```http
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id
```

### AI Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "message": "I have a headache and fever",
  "context": "diagnosis",
  "userId": "user_id"
}
```

### Health Monitoring
```http
POST /api/health-monitor
Content-Type: application/json

{
  "vitalSigns": {
    "heartRate": 75,
    "bloodPressure": "120/80",
    "temperature": 98.6
  },
  "symptoms": ["headache", "fever"],
  "userId": "user_id"
}
```

### Real-time Communication
WebSocket events for real-time features:
- `join`: Join user room
- `joinCall`: Join telemedicine call
- `stream`: Video/audio streaming
- `chatMessage`: Real-time messaging
- `healthUpdate`: Live health data

## 🚀 Deployment

### Production Deployment
```bash
# 1. Build the application
npm run build

# 2. Set production environment
export NODE_ENV=production

# 3. Start with PM2
npm install -g pm2
pm2 start ecosystem.config.js

# 4. Or use Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Deployment
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Update and restart
docker-compose pull
docker-compose up -d
```

### Environment-Specific Configurations
- **Development**: `docker-compose.yml`
- **Staging**: `docker-compose.staging.yml`
- **Production**: `docker-compose.prod.yml`

## 📈 Monitoring

### Health Checks
- **API Health**: `GET /health`
- **Database**: MongoDB connection status
- **Cache**: Redis connection status
- **AI Services**: OpenAI/Gemini API status

### Metrics & Monitoring
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Kibana**: http://localhost:5601
- **Application Logs**: `docker-compose logs -f`

### Performance Metrics
- **Response Time**: < 100ms for API calls
- **AI Response**: < 2 seconds for AI queries
- **Uptime**: 99.9% availability target
- **Concurrent Users**: 1000+ supported

## 🔒 Security

### Data Protection
- **HIPAA Compliance**: Healthcare data protection standards
- **End-to-end Encryption**: Secure data transmission
- **Data Anonymization**: Privacy-preserving analytics
- **Audit Logging**: Complete activity tracking

### Authentication & Authorization
- **JWT Tokens**: Secure authentication
- **Role-based Access**: Granular permission system
- **Session Management**: Secure session handling
- **Rate Limiting**: API abuse prevention

### Infrastructure Security
- **HTTPS**: SSL/TLS encryption
- **Helmet.js**: Security headers
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: MongoDB ODM

## 🧪 Testing

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository
```bash
git clone https://github.com/your-username/swasthya-setu.git
cd swasthya-setu
```

### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes
- Follow the coding standards
- Add tests for new features
- Update documentation

### 4. Commit Changes
```bash
git commit -m "Add amazing feature"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/amazing-feature
```

### Development Guidelines
- **Code Style**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Documentation**: JSDoc comments
- **Commits**: Conventional Commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: [docs.swasthya-setu.com](https://docs.swasthya-setu.com)
- **Issues**: [GitHub Issues](https://github.com/swasthya-setu/issues)
- **Discussions**: [GitHub Discussions](https://github.com/swasthya-setu/discussions)
- **Email**: support@swasthya-setu.com

### Troubleshooting

#### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
lsof -i :5000
# Kill the process
kill -9 <PID>
```

**2. MongoDB Connection Failed**
```bash
# Check MongoDB status
docker-compose ps mongo
# Restart MongoDB
docker-compose restart mongo
```

**3. AI Services Not Working**
```bash
# Check API keys
echo $OPENAI_API_KEY
echo $GOOGLE_GEMINI_API_KEY
# Test API connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

**4. Frontend Build Issues**
```bash
# Clear cache
cd client && npm run build -- --reset-cache
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization
- **Database Indexing**: Optimize MongoDB queries
- **Caching**: Redis for frequently accessed data
- **CDN**: Cloudinary for media delivery
- **Compression**: Gzip compression enabled

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 integration
- **Google** for Gemini AI models
- **LangChain** for AI workflow framework
- **React** team for the amazing frontend framework
- **Healthcare professionals** for domain expertise
- **Open source community** for amazing tools and libraries

---

**SwasthyaSetu** - Bridging the gap in healthcare with AI innovation. 🏥✨

*Built with ❤️ for better healthcare access worldwide.* 