const { ChatOpenAI } = require('@langchain/openai');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const { StateGraph, END } = require('langgraph');

class TelemedicineAgent {
  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.1,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    
    this.workflow = this.createTelemedicineWorkflow();
    this.activeSessions = new Map();
  }

  createTelemedicineWorkflow() {
    const workflow = new StateGraph({
      channels: {
        patientInfo: { value: null },
        symptoms: { value: null },
        consultationType: { value: null },
        doctorAvailability: { value: null },
        sessionData: { value: null },
        recommendations: { value: null }
      }
    });

    // Add workflow nodes
    workflow.addNode("patient_assessment", this.assessPatient.bind(this));
    workflow.addNode("symptom_triage", this.triageSymptoms.bind(this));
    workflow.addNode("doctor_matching", this.matchDoctor.bind(this));
    workflow.addNode("session_preparation", this.prepareSession.bind(this));
    workflow.addNode("consultation_support", this.supportConsultation.bind(this));
    workflow.addNode("post_consultation", this.postConsultation.bind(this));

    // Define workflow flow
    workflow.addEdge("patient_assessment", "symptom_triage");
    workflow.addEdge("symptom_triage", "doctor_matching");
    workflow.addEdge("doctor_matching", "session_preparation");
    workflow.addEdge("session_preparation", "consultation_support");
    workflow.addEdge("consultation_support", "post_consultation");
    workflow.addEdge("post_consultation", END);

    return workflow.compile();
  }

  async assessPatient(state) {
    const { patientInfo } = state;
    
    const prompt = new SystemMessage(`
      Assess patient for telemedicine consultation:
      
      Patient Info: ${JSON.stringify(patientInfo)}
      
      Evaluate:
      - Suitability for telemedicine
      - Urgency level
      - Required consultation type
      - Special considerations
    `);

    const response = await this.llm.invoke([prompt]);
    
    return {
      ...state,
      assessment: response.content
    };
  }

  async triageSymptoms(state) {
    const { symptoms, assessment } = state;
    
    const prompt = new SystemMessage(`
      Triage symptoms for telemedicine:
      
      Symptoms: ${symptoms}
      Assessment: ${assessment}
      
      Determine:
      - Urgency level (emergency, urgent, routine)
      - Consultation type needed
      - Whether telemedicine is appropriate
      - Red flags requiring immediate attention
    `);

    const response = await this.llm.invoke([prompt]);
    
    return {
      ...state,
      triage: response.content
    };
  }

  async matchDoctor(state) {
    const { triage, patientInfo } = state;
    
    const prompt = new SystemMessage(`
      Match patient with appropriate doctor:
      
      Triage: ${triage}
      Patient Info: ${JSON.stringify(patientInfo)}
      
      Consider:
      - Specialty requirements
      - Availability
      - Patient preferences
      - Urgency level
    `);

    const response = await this.llm.invoke([prompt]);
    
    return {
      ...state,
      doctorMatch: response.content
    };
  }

  async prepareSession(state) {
    const { doctorMatch, patientInfo, symptoms } = state;
    
    const prompt = new SystemMessage(`
      Prepare telemedicine session:
      
      Doctor Match: ${doctorMatch}
      Patient Info: ${JSON.stringify(patientInfo)}
      Symptoms: ${symptoms}
      
      Prepare:
      - Session agenda
      - Required information
      - Technical setup instructions
      - Emergency protocols
    `);

    const response = await this.llm.invoke([prompt]);
    
    return {
      ...state,
      sessionPrep: response.content
    };
  }

  async supportConsultation(state) {
    const { sessionPrep, sessionData } = state;
    
    const prompt = new SystemMessage(`
      Support ongoing telemedicine consultation:
      
      Session Prep: ${sessionPrep}
      Session Data: ${JSON.stringify(sessionData)}
      
      Provide:
      - Real-time assistance
      - Information retrieval
      - Documentation support
      - Decision support
    `);

    const response = await this.llm.invoke([prompt]);
    
    return {
      ...state,
      consultationSupport: response.content
    };
  }

  async postConsultation(state) {
    const { consultationSupport } = state;
    
    const prompt = new SystemMessage(`
      Handle post-consultation tasks:
      
      Consultation Support: ${consultationSupport}
      
      Generate:
      - Follow-up recommendations
      - Prescription management
      - Appointment scheduling
      - Patient education materials
    `);

    const response = await this.llm.invoke([prompt]);
    
    return {
      ...state,
      postConsultation: response.content
    };
  }

  async processTelemedicineRequest(message, userId) {
    try {
      const sessionId = this.generateSessionId();
      
      // Extract consultation details
      const consultationDetails = await this.extractConsultationDetails(message);
      
      // Run telemedicine workflow
      const result = await this.workflow.invoke({
        patientInfo: await this.getPatientInfo(userId),
        symptoms: consultationDetails.symptoms,
        consultationType: consultationDetails.type
      });
      
      // Store session data
      this.activeSessions.set(sessionId, {
        userId,
        startTime: new Date(),
        status: 'active',
        data: result
      });
      
      return {
        sessionId,
        assessment: result.assessment,
        triage: result.triage,
        doctorMatch: result.doctorMatch,
        sessionPrep: result.sessionPrep,
        recommendations: result.postConsultation
      };
    } catch (error) {
      console.error('Telemedicine request error:', error);
      throw new Error('Failed to process telemedicine request');
    }
  }

  async extractConsultationDetails(message) {
    const prompt = new SystemMessage(`
      Extract telemedicine consultation details from:
      ${message}
      
      Return structured information about:
      - Symptoms
      - Consultation type
      - Urgency level
      - Special requirements
    `);

    const response = await this.llm.invoke([prompt]);
    
    // Parse the response to extract structured data
    return {
      symptoms: this.extractSymptoms(response.content),
      type: this.extractConsultationType(response.content),
      urgency: this.extractUrgency(response.content)
    };
  }

  async getPatientInfo(userId) {
    // This would fetch from database
    return {
      id: userId,
      name: "Patient Name",
      age: 30,
      medicalHistory: "No significant history",
      allergies: "None known",
      currentMedications: []
    };
  }

  async joinSession(sessionId, userId, userType) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Update session with new participant
      session.participants = session.participants || [];
      session.participants.push({ userId, userType, joinTime: new Date() });
      
      return {
        sessionId,
        status: 'joined',
        participants: session.participants,
        sessionData: session.data
      };
    } catch (error) {
      console.error('Join session error:', error);
      throw new Error('Failed to join session');
    }
  }

  async endSession(sessionId) {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      session.status = 'ended';
      session.endTime = new Date();
      
      // Generate session summary
      const summary = await this.generateSessionSummary(session);
      
      return {
        sessionId,
        status: 'ended',
        summary,
        duration: session.endTime - session.startTime
      };
    } catch (error) {
      console.error('End session error:', error);
      throw new Error('Failed to end session');
    }
  }

  async generateSessionSummary(session) {
    const prompt = new SystemMessage(`
      Generate a comprehensive telemedicine session summary:
      
      Session Data: ${JSON.stringify(session.data)}
      Duration: ${session.endTime - session.startTime}ms
      Participants: ${JSON.stringify(session.participants)}
      
      Include:
      - Key findings
      - Recommendations
      - Follow-up actions
      - Prescriptions
      - Next steps
    `);

    const response = await this.llm.invoke([prompt]);
    return response.content;
  }

  async getAvailableDoctors(specialty = null, urgency = 'routine') {
    // This would fetch from database
    const doctors = [
      {
        id: 'doc1',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology',
        availability: 'available',
        rating: 4.8,
        experience: '15 years'
      },
      {
        id: 'doc2',
        name: 'Dr. Michael Chen',
        specialty: 'General Medicine',
        availability: 'available',
        rating: 4.6,
        experience: '12 years'
      }
    ];
    
    if (specialty) {
      return doctors.filter(doc => doc.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    
    return doctors;
  }

  async scheduleFollowUp(sessionId, patientId, doctorId, date) {
    try {
      // This would create appointment in database
      const appointment = {
        id: this.generateAppointmentId(),
        sessionId,
        patientId,
        doctorId,
        date,
        type: 'follow-up',
        status: 'scheduled'
      };
      
      return appointment;
    } catch (error) {
      console.error('Schedule follow-up error:', error);
      throw new Error('Failed to schedule follow-up');
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateAppointmentId() {
    return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractSymptoms(content) {
    // Simple extraction - in production, use more sophisticated NLP
    return content.toLowerCase().includes('symptom') ? content : 'No specific symptoms mentioned';
  }

  extractConsultationType(content) {
    if (content.toLowerCase().includes('emergency')) return 'emergency';
    if (content.toLowerCase().includes('urgent')) return 'urgent';
    return 'routine';
  }

  extractUrgency(content) {
    if (content.toLowerCase().includes('emergency')) return 'high';
    if (content.toLowerCase().includes('urgent')) return 'medium';
    return 'low';
  }
}

module.exports = { TelemedicineAgent }; 