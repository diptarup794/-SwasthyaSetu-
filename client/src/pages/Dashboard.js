import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Calendar,
  MessageCircle,
  Video,
  Pill,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

// Import components
import VitalSignsWidget from '../components/dashboard/VitalSignsWidget';
import HealthInsightsWidget from '../components/dashboard/HealthInsightsWidget';
import AppointmentWidget from '../components/dashboard/AppointmentWidget';
import MedicationWidget from '../components/dashboard/MedicationWidget';
import AIRecommendationsWidget from '../components/dashboard/AIRecommendationsWidget';
import EmergencyAlertWidget from '../components/dashboard/EmergencyAlertWidget';

// Import services
import { healthService } from '../services/healthService';
import { appointmentService } from '../services/appointmentService';
import { medicationService } from '../services/medicationService';

const Dashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  // Fetch health data
  const { data: healthData, isLoading: healthLoading } = useQuery(
    ['healthData', selectedTimeRange],
    () => healthService.getHealthData(selectedTimeRange),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000,
    }
  );

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery(
    ['appointments', 'upcoming'],
    () => appointmentService.getUpcomingAppointments(),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  // Fetch medications
  const { data: medications, isLoading: medicationsLoading } = useQuery(
    ['medications', 'current'],
    () => medicationService.getCurrentMedications(),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  // Fetch AI insights
  const { data: aiInsights, isLoading: insightsLoading } = useQuery(
    ['aiInsights'],
    () => healthService.getAIInsights(),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  // Sample data for charts
  const vitalSignsData = [
    { time: '00:00', heartRate: 72, bloodPressure: 120, temperature: 98.6, oxygen: 98 },
    { time: '04:00', heartRate: 68, bloodPressure: 118, temperature: 98.4, oxygen: 97 },
    { time: '08:00', heartRate: 75, bloodPressure: 122, temperature: 98.8, oxygen: 99 },
    { time: '12:00', heartRate: 78, bloodPressure: 125, temperature: 99.0, oxygen: 98 },
    { time: '16:00', heartRate: 76, bloodPressure: 123, temperature: 98.9, oxygen: 97 },
    { time: '20:00', heartRate: 73, bloodPressure: 121, temperature: 98.7, oxygen: 98 },
  ];

  const healthTrendsData = [
    { day: 'Mon', steps: 8500, calories: 2100, sleep: 7.5, water: 8 },
    { day: 'Tue', steps: 9200, calories: 1950, sleep: 8.0, water: 7 },
    { day: 'Wed', steps: 7800, calories: 2200, sleep: 6.5, water: 9 },
    { day: 'Thu', steps: 10500, calories: 1800, sleep: 8.5, water: 8 },
    { day: 'Fri', steps: 8900, calories: 2000, sleep: 7.0, water: 7 },
    { day: 'Sat', steps: 6500, calories: 2400, sleep: 9.0, water: 6 },
    { day: 'Sun', steps: 7200, calories: 2100, sleep: 8.0, water: 8 },
  ];

  const medicationAdherenceData = [
    { name: 'Lisinopril', taken: 28, missed: 2, adherence: 93 },
    { name: 'Metformin', taken: 56, missed: 4, adherence: 93 },
    { name: 'Aspirin', taken: 28, missed: 1, adherence: 96 },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your health overview</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </motion.div>

      {/* Emergency Alerts */}
      {emergencyAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-semibold">Emergency Alerts</h3>
          </div>
          {emergencyAlerts.map((alert, index) => (
            <p key={index} className="text-red-700 mt-1">{alert.message}</p>
          ))}
        </motion.div>
      )}

      {/* Main Dashboard Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left Column */}
        <div className="space-y-6">
          {/* Vital Signs Widget */}
          <motion.div variants={itemVariants}>
            <VitalSignsWidget 
              data={healthData?.vitalSigns || vitalSignsData}
              loading={healthLoading}
            />
          </motion.div>

          {/* Health Trends Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={healthTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="steps" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="calories" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Medication Adherence */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication Adherence</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={medicationAdherenceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, adherence }) => `${name}: ${adherence}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="adherence"
                >
                  {medicationAdherenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Center Column */}
        <div className="space-y-6">
          {/* AI Health Insights */}
          <motion.div variants={itemVariants}>
            <HealthInsightsWidget 
              insights={aiInsights}
              loading={insightsLoading}
            />
          </motion.div>

          {/* Real-time Vital Signs Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Vital Signs</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vitalSignsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="heartRate" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="bloodPressure" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <MessageCircle className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Chat with AI</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <Video className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Start Consultation</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <Calendar className="h-6 w-6 text-purple-600 mr-2" />
                <span className="text-purple-800 font-medium">Book Appointment</span>
              </button>
              <button className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <Pill className="h-6 w-6 text-orange-600 mr-2" />
                <span className="text-orange-800 font-medium">Medication Reminder</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <motion.div variants={itemVariants}>
            <AppointmentWidget 
              appointments={appointments}
              loading={appointmentsLoading}
            />
          </motion.div>

          {/* Current Medications */}
          <motion.div variants={itemVariants}>
            <MedicationWidget 
              medications={medications}
              loading={medicationsLoading}
            />
          </motion.div>

          {/* AI Recommendations */}
          <motion.div variants={itemVariants}>
            <AIRecommendationsWidget 
              recommendations={aiInsights?.recommendations}
              loading={insightsLoading}
            />
          </motion.div>

          {/* Health Score */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Score</h3>
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.85)}`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">85%</span>
                </div>
              </div>
              <p className="text-gray-600 mt-2">Excellent health status</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Section - Detailed Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Sleep Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={healthTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sleep" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Steps Today</span>
              <span className="font-semibold text-gray-900">8,547</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Calories Burned</span>
              <span className="font-semibold text-gray-900">2,134</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Minutes</span>
              <span className="font-semibold text-gray-900">45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Water Intake</span>
              <span className="font-semibold text-gray-900">7/8 glasses</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 