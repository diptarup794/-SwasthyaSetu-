const { StateGraph, END } = require('langgraph');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');

class HealthAIAgent {
  constructor() {
    // Initialize Google Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: {
        temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.1,
        maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS) || 2000,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });
    
    // Initialize LangChain with Gemini
    this.llm = new ChatGoogleGenerativeAI({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.1,
      maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS) || 2000,
      googleApiKey: process.env.GOOGLE_API_KEY
    });
    
    this.workflow = this.createHealthWorkflow();
    this.parser = StructuredOutputParser.fromNamesAndDescriptions({
      diagnosis: "Possible diagnosis based on symptoms",
      confidence: "Confidence level (0-1)",
      severity: "Severity level (low, medium, high, critical)",
      recommendations: "List of recommendations",
      urgency: "Whether immediate medical attention is needed (true/false)",
      followUp: "Follow-up actions required"
    });
  }

  createHealthWorkflow() {
    const workflow = new StateGraph({
      channels: {
        symptoms: { value: null },
        medicalHistory: { value: null },
        vitalSigns: { value: null },
        analysis: { value: null },
        recommendations: { value: null }
      }
    });

    // Add nodes for different stages of health analysis
    workflow.addNode("symptom_analysis", this.analyzeSymptoms.bind(this));
    workflow.addNode("history_review", this.reviewMedicalHistory.bind(this));
    workflow.addNode("vital_analysis", this.analyzeVitalSigns.bind(this));
    workflow.addNode("diagnosis_generation", this.generateDiagnosis.bind(this));
    workflow.addNode("recommendation_engine", this.generateRecommendations.bind(this));

    // Define the workflow flow
    workflow.addEdge("symptom_analysis", "history_review");
    workflow.addEdge("history_review", "vital_analysis");
    workflow.addEdge("vital_analysis", "diagnosis_generation");
    workflow.addEdge("diagnosis_generation", "recommendation_engine");
    workflow.addEdge("recommendation_engine", END);

    return workflow.compile();
  }

  async analyzeSymptoms(state) {
    const { symptoms } = state;
    
    const prompt = `You are an expert medical AI analyzing patient symptoms. 
    Analyze the following symptoms and provide structured insights:
    ${symptoms}
    
    Focus on:
    - Symptom patterns and correlations
    - Potential underlying causes
    - Red flags that need immediate attention
    - Differential diagnoses to consider`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        symptomAnalysis: text
      };
    } catch (error) {
      console.error('Symptom analysis error:', error);
      return {
        ...state,
        symptomAnalysis: "Unable to analyze symptoms at this time."
      };
    }
  }

  async reviewMedicalHistory(state) {
    const { medicalHistory, symptomAnalysis } = state;
    
    const prompt = `Review the patient's medical history in context of current symptoms:
    
    Medical History: ${medicalHistory}
    Symptom Analysis: ${symptomAnalysis}
    
    Identify:
    - Relevant historical conditions
    - Medication interactions
    - Risk factors
    - Patterns in health progression
    - Family history implications`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        historyReview: text
      };
    } catch (error) {
      console.error('History review error:', error);
      return {
        ...state,
        historyReview: "Unable to review medical history at this time."
      };
    }
  }

  async analyzeVitalSigns(state) {
    const { vitalSigns, historyReview } = state;
    
    const prompt = `Analyze vital signs in medical context:
    
    Vital Signs: ${JSON.stringify(vitalSigns)}
    History Review: ${historyReview}
    
    Assess:
    - Normal vs abnormal ranges
    - Trends and patterns
    - Correlation with symptoms
    - Emergency indicators
    - Clinical significance`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        vitalAnalysis: text
      };
    } catch (error) {
      console.error('Vital signs analysis error:', error);
      return {
        ...state,
        vitalAnalysis: "Unable to analyze vital signs at this time."
      };
    }
  }

  async generateDiagnosis(state) {
    const { symptomAnalysis, historyReview, vitalAnalysis } = state;
    
    const prompt = `Generate a comprehensive diagnosis based on all available information:
    
    Symptom Analysis: ${symptomAnalysis}
    History Review: ${historyReview}
    Vital Analysis: ${vitalAnalysis}
    
    Provide:
    - Primary diagnosis with confidence level
    - Differential diagnoses
    - Severity assessment
    - Risk factors identified
    - Clinical reasoning`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        diagnosis: text
      };
    } catch (error) {
      console.error('Diagnosis generation error:', error);
      return {
        ...state,
        diagnosis: "Unable to generate diagnosis at this time."
      };
    }
  }

  async generateRecommendations(state) {
    const { diagnosis } = state;
    
    const prompt = `Generate actionable healthcare recommendations:
    
    Diagnosis: ${diagnosis}
    
    Provide:
    - Immediate actions needed
    - Treatment recommendations
    - Lifestyle modifications
    - Follow-up schedule
    - Emergency protocols if needed
    - Patient education points`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        recommendations: text
      };
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return {
        ...state,
        recommendations: "Unable to generate recommendations at this time."
      };
    }
  }

  async processDiagnosis(message, userId) {
    try {
      // Extract symptoms from message using NLP
      const symptoms = await this.extractSymptoms(message);
      
      // Get user's medical history
      const medicalHistory = await this.getMedicalHistory(userId);
      
      // Get current vital signs (if available)
      const vitalSigns = await this.getVitalSigns(userId);
      
      // Run the workflow
      const result = await this.workflow.invoke({
        symptoms,
        medicalHistory,
        vitalSigns
      });
      
      return {
        diagnosis: result.diagnosis,
        recommendations: result.recommendations,
        confidence: result.confidence,
        severity: result.severity,
        urgency: result.urgency
      };
    } catch (error) {
      console.error('Diagnosis processing error:', error);
      throw new Error('Failed to process diagnosis');
    }
  }

  async processGeneralQuery(message, userId) {
    try {
      const prompt = `You are SwasthyaSetu, an AI healthcare assistant. 
      Provide helpful, accurate, and empathetic responses to health-related queries.
      Always recommend consulting healthcare professionals for serious concerns.
      
      User Query: ${message}
      
      Guidelines:
      - Be informative but not alarmist
      - Suggest professional consultation when appropriate
      - Provide evidence-based information
      - Maintain patient privacy and confidentiality`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        response: text,
        type: 'general',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('General query error:', error);
      throw new Error('Failed to process query');
    }
  }

  async extractSymptoms(message) {
    const prompt = `Extract medical symptoms from the following text. 
    Return only the symptoms in a structured format:
    
    Text: ${message}
    
    Format the response as a clear list of symptoms with their characteristics.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Symptom extraction error:', error);
      return "Unable to extract symptoms from the provided text.";
    }
  }

  async getMedicalHistory(userId) {
    // This would typically fetch from database
    // For now, return a placeholder
    return "No significant medical history available";
  }

  async getVitalSigns(userId) {
    // This would typically fetch from database or IoT devices
    // For now, return placeholder data
    return {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 98
    };
  }

  async analyzeHealthTrends(userId, timeRange = '30d') {
    try {
      // Analyze health data trends over time
      const healthData = await this.getHealthData(userId, timeRange);
      
      const prompt = `Analyze health trends from the following data:
      ${JSON.stringify(healthData)}
      
      Identify:
      - Positive trends
      - Concerning patterns
      - Recommendations for improvement
      - Predictive insights`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        trends: text,
        dataPoints: healthData.length,
        timeRange
      };
    } catch (error) {
      console.error('Trend analysis error:', error);
      throw new Error('Failed to analyze health trends');
    }
  }

  async getHealthData(userId, timeRange) {
    // This would fetch from database
    // Placeholder implementation
    return [
      { date: '2024-01-01', heartRate: 72, bloodPressure: '120/80' },
      { date: '2024-01-02', heartRate: 75, bloodPressure: '118/78' }
    ];
  }
}

module.exports = { HealthAIAgent }; 