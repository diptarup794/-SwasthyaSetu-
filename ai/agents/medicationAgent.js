const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const { StateGraph, END } = require('langgraph');

class MedicationAgent {
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
    
    this.workflow = this.createMedicationWorkflow();
    this.medicationDatabase = new Map();
    this.interactionChecker = new Map();
  }

  createMedicationWorkflow() {
    const workflow = new StateGraph({
      channels: {
        prescription: { value: null },
        patientProfile: { value: null },
        currentMedications: { value: null },
        allergies: { value: null },
        analysis: { value: null },
        recommendations: { value: null }
      }
    });

    // Add workflow nodes
    workflow.addNode("prescription_analysis", this.analyzePrescription.bind(this));
    workflow.addNode("interaction_check", this.checkInteractions.bind(this));
    workflow.addNode("allergy_verification", this.verifyAllergies.bind(this));
    workflow.addNode("dosage_optimization", this.optimizeDosage.bind(this));
    workflow.addNode("safety_assessment", this.assessSafety.bind(this));
    workflow.addNode("recommendation_generation", this.generateRecommendations.bind(this));

    // Define workflow flow
    workflow.addEdge("prescription_analysis", "interaction_check");
    workflow.addEdge("interaction_check", "allergy_verification");
    workflow.addEdge("allergy_verification", "dosage_optimization");
    workflow.addEdge("dosage_optimization", "safety_assessment");
    workflow.addEdge("safety_assessment", "recommendation_generation");
    workflow.addEdge("recommendation_generation", END);

    return workflow.compile();
  }

  async analyzePrescription(state) {
    const { prescription } = state;
    
    const prompt = `Analyze prescription for safety and appropriateness:
    
    Prescription: ${JSON.stringify(prescription)}
    
    Evaluate:
    - Medication appropriateness
    - Dosage accuracy
    - Frequency and timing
    - Route of administration
    - Duration of therapy
    - Indications and contraindications`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        prescriptionAnalysis: text
      };
    } catch (error) {
      console.error('Prescription analysis error:', error);
      return {
        ...state,
        prescriptionAnalysis: "Unable to analyze prescription at this time."
      };
    }
  }

  async checkInteractions(state) {
    const { prescription, currentMedications, prescriptionAnalysis } = state;
    
    const prompt = `Check for drug interactions:
    
    New Prescription: ${JSON.stringify(prescription)}
    Current Medications: ${JSON.stringify(currentMedications)}
    Prescription Analysis: ${prescriptionAnalysis}
    
    Identify:
    - Drug-drug interactions
    - Severity levels
    - Contraindications
    - Precautions needed
    - Alternative medications
    - Monitoring requirements`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        interactionAnalysis: text
      };
    } catch (error) {
      console.error('Interaction check error:', error);
      return {
        ...state,
        interactionAnalysis: "Unable to check interactions at this time."
      };
    }
  }

  async verifyAllergies(state) {
    const { prescription, allergies, interactionAnalysis } = state;
    
    const prompt = `Verify allergy safety:
    
    Prescription: ${JSON.stringify(prescription)}
    Known Allergies: ${JSON.stringify(allergies)}
    Interaction Analysis: ${interactionAnalysis}
    
    Check:
    - Cross-reactivity
    - Allergen components
    - Alternative options
    - Risk assessment
    - Emergency protocols`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        allergyVerification: text
      };
    } catch (error) {
      console.error('Allergy verification error:', error);
      return {
        ...state,
        allergyVerification: "Unable to verify allergies at this time."
      };
    }
  }

  async optimizeDosage(state) {
    const { prescription, patientProfile, allergyVerification } = state;
    
    const prompt = `Optimize medication dosage:
    
    Prescription: ${JSON.stringify(prescription)}
    Patient Profile: ${JSON.stringify(patientProfile)}
    Allergy Verification: ${allergyVerification}
    
    Consider:
    - Age and weight
    - Renal/hepatic function
    - Comorbidities
    - Genetic factors
    - Optimal timing
    - Titration schedule`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        dosageOptimization: text
      };
    } catch (error) {
      console.error('Dosage optimization error:', error);
      return {
        ...state,
        dosageOptimization: "Unable to optimize dosage at this time."
      };
    }
  }

  async assessSafety(state) {
    const { dosageOptimization, interactionAnalysis, allergyVerification } = state;
    
    const prompt = `Assess overall medication safety:
    
    Dosage Optimization: ${dosageOptimization}
    Interaction Analysis: ${interactionAnalysis}
    Allergy Verification: ${allergyVerification}
    
    Evaluate:
    - Overall safety profile
    - Risk-benefit ratio
    - Monitoring requirements
    - Patient education needs
    - Emergency preparedness
    - Follow-up schedule`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        ...state,
        safetyAssessment: text
      };
    } catch (error) {
      console.error('Safety assessment error:', error);
      return {
        ...state,
        safetyAssessment: "Unable to assess safety at this time."
      };
    }
  }

  async generateRecommendations(state) {
    const { safetyAssessment, prescription } = state;
    
    const prompt = `Generate medication recommendations:
    
    Safety Assessment: ${safetyAssessment}
    Prescription: ${JSON.stringify(prescription)}
    
    Provide:
    - Final recommendations
    - Patient instructions
    - Monitoring schedule
    - Side effect management
    - Emergency contacts
    - Follow-up plan`;

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

  async processMedicationRequest(message, userId) {
    try {
      // Extract medication information from message
      const medicationInfo = await this.extractMedicationInfo(message);
      
      // Get patient profile and current medications
      const patientProfile = await this.getPatientProfile(userId);
      const currentMedications = await this.getCurrentMedications(userId);
      const allergies = await this.getAllergies(userId);
      
      // Run medication workflow
      const result = await this.workflow.invoke({
        prescription: medicationInfo,
        patientProfile,
        currentMedications,
        allergies
      });
      
      return {
        analysis: result.prescriptionAnalysis,
        interactions: result.interactionAnalysis,
        allergies: result.allergyVerification,
        dosage: result.dosageOptimization,
        safety: result.safetyAssessment,
        recommendations: result.recommendations
      };
    } catch (error) {
      console.error('Medication request error:', error);
      throw new Error('Failed to process medication request');
    }
  }

  async extractMedicationInfo(message) {
    const prompt = `Extract medication information from:
    ${message}
    
    Return structured information about:
    - Medication name
    - Dosage
    - Frequency
    - Duration
    - Route of administration
    - Special instructions`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response to extract structured data
      return this.parseMedicationInfo(text);
    } catch (error) {
      console.error('Medication info extraction error:', error);
      return {
        name: "Unknown medication",
        dosage: "Unknown",
        frequency: "Unknown",
        duration: "Unknown"
      };
    }
  }

  async getPatientProfile(userId) {
    // This would fetch from database
    return {
      id: userId,
      age: 30,
      weight: 70,
      height: 170,
      gender: 'Not specified',
      renalFunction: 'Normal',
      hepaticFunction: 'Normal',
      comorbidities: []
    };
  }

  async getCurrentMedications(userId) {
    // This would fetch from database
    return [
      {
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'daily',
        startDate: '2024-01-01'
      }
    ];
  }

  async getAllergies(userId) {
    // This would fetch from database
    return [
      {
        allergen: 'Penicillin',
        severity: 'Severe',
        reaction: 'Anaphylaxis'
      }
    ];
  }

  async checkDrugInteractions(medication1, medication2) {
    const prompt = `Check for drug interactions between:
    Medication 1: ${JSON.stringify(medication1)}
    Medication 2: ${JSON.stringify(medication2)}
    
    Analyze:
    - Interaction type
    - Severity
    - Mechanism
    - Clinical significance
    - Management recommendations`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Drug interaction check error:', error);
      return "Unable to check drug interactions at this time.";
    }
  }

  async generateMedicationSchedule(medications, patientProfile) {
    const prompt = `Generate optimal medication schedule:
    
    Medications: ${JSON.stringify(medications)}
    Patient Profile: ${JSON.stringify(patientProfile)}
    
    Create:
    - Timing schedule
    - Food interactions
    - Reminder system
    - Compliance strategies
    - Monitoring schedule`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Medication schedule generation error:', error);
      return "Unable to generate medication schedule at this time.";
    }
  }

  async monitorAdherence(userId, medicationId, adherenceData) {
    const prompt = `Analyze medication adherence:
    
    Adherence Data: ${JSON.stringify(adherenceData)}
    
    Assess:
    - Adherence rate
    - Missed doses
    - Patterns
    - Risk factors
    - Intervention strategies
    - Patient education needs`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Adherence monitoring error:', error);
      return "Unable to monitor adherence at this time.";
    }
  }

  async generateSideEffectReport(medication, sideEffects) {
    const prompt = `Analyze medication side effects:
    
    Medication: ${JSON.stringify(medication)}
    Reported Side Effects: ${JSON.stringify(sideEffects)}
    
    Evaluate:
    - Expected vs unexpected effects
    - Severity assessment
    - Management strategies
    - Reporting requirements
    - Alternative options`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Side effect report generation error:', error);
      return "Unable to generate side effect report at this time.";
    }
  }

  parseMedicationInfo(text) {
    // Simple parsing - in production, use more sophisticated NLP
    const lines = text.split('\n');
    const info = {};
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('name:')) {
        info.name = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('dosage:')) {
        info.dosage = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('frequency:')) {
        info.frequency = line.split(':')[1]?.trim();
      } else if (line.toLowerCase().includes('duration:')) {
        info.duration = line.split(':')[1]?.trim();
      }
    });
    
    return info;
  }

  async searchMedicationDatabase(query) {
    // This would search a comprehensive medication database
    const prompt = `Search medication database for:
    ${query}
    
    Return:
    - Generic and brand names
    - Indications
    - Contraindications
    - Side effects
    - Dosage information
    - Drug interactions`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Medication database search error:', error);
      return "Unable to search medication database at this time.";
    }
  }

  async validatePrescription(prescription, patientProfile) {
    const prompt = `Validate prescription for patient:
    
    Prescription: ${JSON.stringify(prescription)}
    Patient Profile: ${JSON.stringify(patientProfile)}
    
    Validate:
    - Appropriateness for patient
    - Dosage accuracy
    - Contraindications
    - Drug interactions
    - Allergy safety
    - Monitoring requirements`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Prescription validation error:', error);
      return "Unable to validate prescription at this time.";
    }
  }
}

module.exports = { MedicationAgent }; 