const { ChatOpenAI } = require('@langchain/openai');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const tf = require('@tensorflow/tfjs-node');

class PredictiveAnalytics {
  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    
    this.models = this.initializeModels();
    this.healthThresholds = this.initializeHealthThresholds();
  }

  initializeModels() {
    return {
      heartDisease: null,
      diabetes: null,
      hypertension: null,
      generalHealth: null
    };
  }

  initializeHealthThresholds() {
    return {
      bloodPressure: {
        normal: { systolic: [90, 120], diastolic: [60, 80] },
        elevated: { systolic: [120, 129], diastolic: [60, 80] },
        high: { systolic: [130, 180], diastolic: [80, 120] },
        crisis: { systolic: [180, 300], diastolic: [120, 200] }
      },
      heartRate: {
        normal: [60, 100],
        bradycardia: [0, 60],
        tachycardia: [100, 200]
      },
      temperature: {
        normal: [97.8, 99.0],
        fever: [99.1, 103.0],
        highFever: [103.1, 106.0]
      },
      oxygenSaturation: {
        normal: [95, 100],
        low: [90, 95],
        critical: [0, 90]
      }
    };
  }

  async analyzeVitalSigns(vitalSigns, symptoms, userId) {
    try {
      // Analyze current vital signs
      const vitalAnalysis = this.analyzeCurrentVitals(vitalSigns);
      
      // Get historical data for trend analysis
      const historicalData = await this.getHistoricalData(userId, '30d');
      
      // Perform trend analysis
      const trends = this.analyzeTrends(historicalData);
      
      // Predict health risks
      const riskPredictions = await this.predictHealthRisks(vitalSigns, symptoms, historicalData);
      
      // Generate recommendations
      const recommendations = await this.generateHealthRecommendations(vitalAnalysis, trends, riskPredictions);
      
      return {
        currentStatus: vitalAnalysis,
        trends: trends,
        riskPredictions: riskPredictions,
        recommendations: recommendations,
        urgency: this.assessUrgency(vitalAnalysis, riskPredictions),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Vital signs analysis error:', error);
      throw new Error('Failed to analyze vital signs');
    }
  }

  analyzeCurrentVitals(vitalSigns) {
    const analysis = {};
    
    // Blood Pressure Analysis
    if (vitalSigns.bloodPressure) {
      const [systolic, diastolic] = vitalSigns.bloodPressure.split('/').map(Number);
      analysis.bloodPressure = {
        systolic,
        diastolic,
        status: this.classifyBloodPressure(systolic, diastolic),
        risk: this.assessBloodPressureRisk(systolic, diastolic)
      };
    }
    
    // Heart Rate Analysis
    if (vitalSigns.heartRate) {
      analysis.heartRate = {
        value: vitalSigns.heartRate,
        status: this.classifyHeartRate(vitalSigns.heartRate),
        risk: this.assessHeartRateRisk(vitalSigns.heartRate)
      };
    }
    
    // Temperature Analysis
    if (vitalSigns.temperature) {
      analysis.temperature = {
        value: vitalSigns.temperature,
        status: this.classifyTemperature(vitalSigns.temperature),
        risk: this.assessTemperatureRisk(vitalSigns.temperature)
      };
    }
    
    // Oxygen Saturation Analysis
    if (vitalSigns.oxygenSaturation) {
      analysis.oxygenSaturation = {
        value: vitalSigns.oxygenSaturation,
        status: this.classifyOxygenSaturation(vitalSigns.oxygenSaturation),
        risk: this.assessOxygenRisk(vitalSigns.oxygenSaturation)
      };
    }
    
    return analysis;
  }

  classifyBloodPressure(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) return 'crisis';
    if (systolic >= 130 || diastolic >= 80) return 'high';
    if (systolic >= 120 && systolic < 130 && diastolic < 80) return 'elevated';
    return 'normal';
  }

  classifyHeartRate(heartRate) {
    if (heartRate < 60) return 'bradycardia';
    if (heartRate > 100) return 'tachycardia';
    return 'normal';
  }

  classifyTemperature(temperature) {
    if (temperature >= 103.1) return 'highFever';
    if (temperature >= 99.1) return 'fever';
    return 'normal';
  }

  classifyOxygenSaturation(spo2) {
    if (spo2 < 90) return 'critical';
    if (spo2 < 95) return 'low';
    return 'normal';
  }

  assessBloodPressureRisk(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) return 'critical';
    if (systolic >= 160 || diastolic >= 100) return 'high';
    if (systolic >= 140 || diastolic >= 90) return 'moderate';
    if (systolic >= 120 || diastolic >= 80) return 'elevated';
    return 'low';
  }

  assessHeartRateRisk(heartRate) {
    if (heartRate < 40 || heartRate > 140) return 'critical';
    if (heartRate < 50 || heartRate > 120) return 'high';
    if (heartRate < 60 || heartRate > 100) return 'moderate';
    return 'low';
  }

  assessTemperatureRisk(temperature) {
    if (temperature >= 105) return 'critical';
    if (temperature >= 103) return 'high';
    if (temperature >= 100.4) return 'moderate';
    return 'low';
  }

  assessOxygenRisk(spo2) {
    if (spo2 < 85) return 'critical';
    if (spo2 < 90) return 'high';
    if (spo2 < 95) return 'moderate';
    return 'low';
  }

  analyzeTrends(historicalData) {
    const trends = {};
    
    // Analyze blood pressure trends
    if (historicalData.bloodPressure && historicalData.bloodPressure.length > 1) {
      trends.bloodPressure = this.calculateTrend(historicalData.bloodPressure, 'systolic');
    }
    
    // Analyze heart rate trends
    if (historicalData.heartRate && historicalData.heartRate.length > 1) {
      trends.heartRate = this.calculateTrend(historicalData.heartRate, 'value');
    }
    
    // Analyze temperature trends
    if (historicalData.temperature && historicalData.temperature.length > 1) {
      trends.temperature = this.calculateTrend(historicalData.temperature, 'value');
    }
    
    return trends;
  }

  calculateTrend(data, key) {
    const values = data.map(d => d[key]).filter(v => v !== null && v !== undefined);
    if (values.length < 2) return { direction: 'stable', slope: 0 };
    
    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return {
      direction: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      slope: slope,
      change: values[values.length - 1] - values[0]
    };
  }

  async predictHealthRisks(vitalSigns, symptoms, historicalData) {
    try {
      const prompt = new SystemMessage(`
        Predict health risks based on:
        
        Current Vital Signs: ${JSON.stringify(vitalSigns)}
        Symptoms: ${symptoms}
        Historical Data: ${JSON.stringify(historicalData)}
        
        Predict:
        - Short-term risks (next 24-48 hours)
        - Medium-term risks (next week)
        - Long-term risks (next month)
        - Specific conditions to watch for
        - Risk factors and probability
      `);

      const response = await this.llm.invoke([prompt]);
      
      return {
        shortTerm: this.extractShortTermRisks(response.content),
        mediumTerm: this.extractMediumTermRisks(response.content),
        longTerm: this.extractLongTermRisks(response.content),
        conditions: this.extractConditions(response.content),
        probability: this.extractProbability(response.content)
      };
    } catch (error) {
      console.error('Risk prediction error:', error);
      return {
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
        conditions: [],
        probability: 'low'
      };
    }
  }

  async generateHealthRecommendations(vitalAnalysis, trends, riskPredictions) {
    try {
      const prompt = new SystemMessage(`
        Generate health recommendations based on:
        
        Vital Analysis: ${JSON.stringify(vitalAnalysis)}
        Trends: ${JSON.stringify(trends)}
        Risk Predictions: ${JSON.stringify(riskPredictions)}
        
        Provide:
        - Immediate actions needed
        - Lifestyle recommendations
        - Medical follow-up requirements
        - Monitoring frequency
        - Emergency protocols
      `);

      const response = await this.llm.invoke([prompt]);
      
      return {
        immediate: this.extractImmediateActions(response.content),
        lifestyle: this.extractLifestyleRecommendations(response.content),
        medical: this.extractMedicalRecommendations(response.content),
        monitoring: this.extractMonitoringRecommendations(response.content),
        emergency: this.extractEmergencyProtocols(response.content)
      };
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return {
        immediate: [],
        lifestyle: [],
        medical: [],
        monitoring: [],
        emergency: []
      };
    }
  }

  assessUrgency(vitalAnalysis, riskPredictions) {
    // Check for critical vital signs
    const criticalVitals = Object.values(vitalAnalysis).some(vital => 
      vital && vital.risk === 'critical'
    );
    
    if (criticalVitals) return 'emergency';
    
    // Check for high-risk predictions
    const highRiskPredictions = riskPredictions.shortTerm.some(risk => 
      risk.severity === 'high' || risk.severity === 'critical'
    );
    
    if (highRiskPredictions) return 'urgent';
    
    // Check for moderate risks
    const moderateRisks = Object.values(vitalAnalysis).some(vital => 
      vital && vital.risk === 'high'
    );
    
    if (moderateRisks) return 'moderate';
    
    return 'routine';
  }

  async predictDiseaseRisk(userId, diseaseType) {
    try {
      const healthData = await this.getComprehensiveHealthData(userId);
      
      const prompt = new SystemMessage(`
        Predict ${diseaseType} risk for patient:
        
        Health Data: ${JSON.stringify(healthData)}
        
        Provide:
        - Risk probability (0-100%)
        - Contributing factors
        - Prevention strategies
        - Monitoring recommendations
        - Timeline for risk assessment
      `);

      const response = await this.llm.invoke([prompt]);
      
      return {
        disease: diseaseType,
        probability: this.extractProbability(response.content),
        factors: this.extractRiskFactors(response.content),
        prevention: this.extractPreventionStrategies(response.content),
        monitoring: this.extractMonitoringPlan(response.content),
        timeline: this.extractTimeline(response.content)
      };
    } catch (error) {
      console.error('Disease risk prediction error:', error);
      throw new Error('Failed to predict disease risk');
    }
  }

  async analyzeHealthPatterns(userId, timeRange = '90d') {
    try {
      const healthData = await this.getHealthData(userId, timeRange);
      
      const prompt = new SystemMessage(`
        Analyze health patterns from:
        ${JSON.stringify(healthData)}
        
        Identify:
        - Recurring patterns
        - Seasonal variations
        - Lifestyle correlations
        - Improvement opportunities
        - Concerning trends
      `);

      const response = await this.llm.invoke([prompt]);
      
      return {
        patterns: response.content,
        insights: this.extractInsights(response.content),
        recommendations: this.extractPatternRecommendations(response.content)
      };
    } catch (error) {
      console.error('Pattern analysis error:', error);
      throw new Error('Failed to analyze health patterns');
    }
  }

  // Helper methods for data extraction
  extractShortTermRisks(content) {
    const risks = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('short-term') || line.toLowerCase().includes('24-48 hours')) {
        risks.push({
          description: line.trim(),
          severity: this.assessSeverity(line),
          timeframe: '24-48 hours'
        });
      }
    }
    
    return risks;
  }

  extractMediumTermRisks(content) {
    const risks = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('medium-term') || line.toLowerCase().includes('week')) {
        risks.push({
          description: line.trim(),
          severity: this.assessSeverity(line),
          timeframe: '1 week'
        });
      }
    }
    
    return risks;
  }

  extractLongTermRisks(content) {
    const risks = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('long-term') || line.toLowerCase().includes('month')) {
        risks.push({
          description: line.trim(),
          severity: this.assessSeverity(line),
          timeframe: '1 month'
        });
      }
    }
    
    return risks;
  }

  extractConditions(content) {
    const conditions = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('condition') || line.toLowerCase().includes('disease')) {
        conditions.push(line.trim());
      }
    }
    
    return conditions;
  }

  extractProbability(content) {
    if (content.toLowerCase().includes('high') || content.toLowerCase().includes('likely')) {
      return 'high';
    } else if (content.toLowerCase().includes('moderate') || content.toLowerCase().includes('possible')) {
      return 'moderate';
    }
    return 'low';
  }

  extractImmediateActions(content) {
    const actions = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('immediate') || line.toLowerCase().includes('urgent')) {
        actions.push(line.trim());
      }
    }
    
    return actions;
  }

  extractLifestyleRecommendations(content) {
    const recommendations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('lifestyle') || line.toLowerCase().includes('diet') || line.toLowerCase().includes('exercise')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations;
  }

  extractMedicalRecommendations(content) {
    const recommendations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('medical') || line.toLowerCase().includes('doctor') || line.toLowerCase().includes('consult')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations;
  }

  extractMonitoringRecommendations(content) {
    const recommendations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('monitor') || line.toLowerCase().includes('track') || line.toLowerCase().includes('check')) {
        recommendations.push(line.trim());
      }
    }
    
    return recommendations;
  }

  extractEmergencyProtocols(content) {
    const protocols = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('emergency') || line.toLowerCase().includes('urgent') || line.toLowerCase().includes('call')) {
        protocols.push(line.trim());
      }
    }
    
    return protocols;
  }

  assessSeverity(content) {
    if (content.toLowerCase().includes('critical') || content.toLowerCase().includes('severe')) {
      return 'critical';
    } else if (content.toLowerCase().includes('high') || content.toLowerCase().includes('serious')) {
      return 'high';
    } else if (content.toLowerCase().includes('moderate') || content.toLowerCase().includes('medium')) {
      return 'moderate';
    }
    return 'low';
  }

  // Data retrieval methods (would connect to database in production)
  async getHistoricalData(userId, timeRange) {
    return {
      bloodPressure: [
        { date: '2024-01-01', systolic: 120, diastolic: 80 },
        { date: '2024-01-02', systolic: 118, diastolic: 78 },
        { date: '2024-01-03', systolic: 122, diastolic: 82 }
      ],
      heartRate: [
        { date: '2024-01-01', value: 72 },
        { date: '2024-01-02', value: 75 },
        { date: '2024-01-03', value: 70 }
      ],
      temperature: [
        { date: '2024-01-01', value: 98.6 },
        { date: '2024-01-02', value: 98.4 },
        { date: '2024-01-03', value: 98.8 }
      ]
    };
  }

  async getComprehensiveHealthData(userId) {
    return {
      demographics: { age: 45, gender: 'M', weight: 70, height: 170 },
      vitals: await this.getHistoricalData(userId, '30d'),
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      medications: ['Lisinopril', 'Metformin'],
      lifestyle: { smoking: false, exercise: 'moderate', diet: 'balanced' }
    };
  }

  async getHealthData(userId, timeRange) {
    return [
      { date: '2024-01-01', heartRate: 72, bloodPressure: '120/80', temperature: 98.6 },
      { date: '2024-01-02', heartRate: 75, bloodPressure: '118/78', temperature: 98.4 },
      { date: '2024-01-03', heartRate: 70, bloodPressure: '122/82', temperature: 98.8 }
    ];
  }

  extractInsights(content) {
    return content.split('\n').filter(line => 
      line.toLowerCase().includes('insight') || line.toLowerCase().includes('pattern')
    );
  }

  extractPatternRecommendations(content) {
    return content.split('\n').filter(line => 
      line.toLowerCase().includes('recommend') || line.toLowerCase().includes('suggest')
    );
  }

  extractRiskFactors(content) {
    return content.split('\n').filter(line => 
      line.toLowerCase().includes('factor') || line.toLowerCase().includes('risk')
    );
  }

  extractPreventionStrategies(content) {
    return content.split('\n').filter(line => 
      line.toLowerCase().includes('prevent') || line.toLowerCase().includes('avoid')
    );
  }

  extractMonitoringPlan(content) {
    return content.split('\n').filter(line => 
      line.toLowerCase().includes('monitor') || line.toLowerCase().includes('check')
    );
  }

  extractTimeline(content) {
    const timelineMatch = content.match(/timeline: (.+)/i);
    return timelineMatch ? timelineMatch[1] : '3 months';
  }
}

module.exports = { PredictiveAnalytics }; 