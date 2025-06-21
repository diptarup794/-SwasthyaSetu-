import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  Paperclip, 
  Bot, 
  User, 
  Heart,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock,
  Video,
  Phone,
  MessageSquare,
  FileText,
  Image,
  Download
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

// Import components
import ChatMessage from '../components/chat/ChatMessage';
import VoiceRecorder from '../components/chat/VoiceRecorder';
import ImageUpload from '../components/chat/ImageUpload';
import SymptomChecker from '../components/chat/SymptomChecker';
import HealthSummary from '../components/chat/HealthSummary';

// Import services
import { chatService } from '../services/chatService';
import { healthService } from '../services/healthService';

const HealthChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatContext, setChatContext] = useState('general');
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showHealthSummary, setShowHealthSummary] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: chatHistory, isLoading: historyLoading } = useQuery(
    ['chatHistory'],
    () => chatService.getChatHistory(),
    {
      onSuccess: (data) => {
        setMessages(data || []);
      }
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    (messageData) => chatService.sendMessage(messageData),
    {
      onSuccess: (response) => {
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
        queryClient.invalidateQueries(['chatHistory']);
      },
      onError: (error) => {
        toast.error('Failed to send message');
        setIsTyping(false);
      }
    }
  );

  // Send file mutation
  const sendFileMutation = useMutation(
    (fileData) => chatService.sendFile(fileData),
    {
      onSuccess: (response) => {
        setMessages(prev => [...prev, response]);
        setSelectedFile(null);
        queryClient.invalidateQueries(['chatHistory']);
      },
      onError: (error) => {
        toast.error('Failed to upload file');
      }
    }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0 && !historyLoading) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Hello! I'm SwasthyaSetu, your AI health assistant. I'm here to help you with:

• Health consultations and symptom analysis
• Medication information and interactions
• Appointment scheduling and reminders
• Health monitoring and recommendations
• Emergency guidance when needed

How can I assist you today?`,
        timestamp: new Date().toISOString(),
        context: 'welcome'
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, historyLoading]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      context: chatContext
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      await sendMessageMutation.mutateAsync({
        message: inputMessage,
        context: chatContext
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    setIsRecording(false);
    setIsTyping(true);

    try {
      const response = await chatService.sendVoiceMessage(audioBlob);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      toast.error('Failed to process voice message');
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file) => {
    setSelectedFile(file);
    setIsTyping(true);

    try {
      await sendFileMutation.mutateAsync({
        file,
        context: chatContext
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleContextChange = (context) => {
    setChatContext(context);
    toast.success(`Switched to ${context} mode`);
  };

  const quickActions = [
    {
      icon: <Heart className="h-5 w-5" />,
      label: 'Symptom Check',
      action: () => setShowSymptomChecker(true),
      color: 'bg-red-50 text-red-600 hover:bg-red-100'
    },
    {
      icon: <Activity className="h-5 w-5" />,
      label: 'Health Summary',
      action: () => setShowHealthSummary(true),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Book Appointment',
      action: () => handleSendMessage('I want to book an appointment'),
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      icon: <Pill className="h-5 w-5" />,
      label: 'Medication Info',
      action: () => handleSendMessage('Tell me about my medications'),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    }
  ];

  const contextOptions = [
    { value: 'general', label: 'General Health', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'diagnosis', label: 'Symptom Analysis', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'medication', label: 'Medication', icon: <Pill className="h-4 w-4" /> },
    { value: 'telemedicine', label: 'Telemedicine', icon: <Video className="h-4 w-4" /> },
    { value: 'emergency', label: 'Emergency', icon: <Phone className="h-4 w-4" /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">SwasthyaSetu AI</h1>
                <p className="text-sm text-gray-500">Your AI Health Assistant</p>
              </div>
            </div>
            
            {/* Context Selector */}
            <div className="flex items-center space-x-2">
              <select
                value={chatContext}
                onChange={(e) => handleContextChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {contextOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-gray-500"
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm">AI is typing...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${action.color}`}
              >
                {action.icon}
                <span className="text-xs mt-1 font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            {/* File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Camera */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Camera className="h-5 w-5" />
            </button>

            {/* Voice Recording */}
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Text Input */}
            <div className="flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your health question..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* File Upload Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="space-y-6">
          {/* Health Status */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Heart Rate</span>
                <span className="text-sm font-medium text-gray-900">72 bpm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blood Pressure</span>
                <span className="text-sm font-medium text-gray-900">120/80</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Temperature</span>
                <span className="text-sm font-medium text-gray-900">98.6°F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Oxygen</span>
                <span className="text-sm font-medium text-gray-900">98%</span>
              </div>
            </div>
          </div>

          {/* Recent Topics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Topics</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Blood pressure management
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Diabetes monitoring
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Medication interactions
              </button>
              <button className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                Exercise recommendations
              </button>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Phone className="h-4 w-4 mr-2" />
                Emergency: 911
              </button>
              <button className="w-full flex items-center p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <MessageSquare className="h-4 w-4 mr-2" />
                Dr. Smith: (555) 123-4567
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Recorder Modal */}
      {isRecording && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceMessage}
          onCancel={() => setIsRecording(false)}
        />
      )}

      {/* Symptom Checker Modal */}
      {showSymptomChecker && (
        <SymptomChecker
          onClose={() => setShowSymptomChecker(false)}
          onSymptomSubmit={(symptoms) => {
            handleSendMessage(`I'm experiencing: ${symptoms.join(', ')}`);
            setShowSymptomChecker(false);
          }}
        />
      )}

      {/* Health Summary Modal */}
      {showHealthSummary && (
        <HealthSummary
          onClose={() => setShowHealthSummary(false)}
        />
      )}
    </div>
  );
};

export default HealthChat; 