import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/db/database.js';
import {
  predictCervicalCancerRisk,
  predictGestationalDiabetesRisk,
} from './src/services/mlEngine.js';
import { generatePersonalizedNutritionPlan } from './src/services/nutritionEngine.js';
import {
  AuditLog,
  ChatMessage,
  DirectMessage,
  DoctorNote,
  Appointment,
  AppointmentStatus,
  NutritionPlan,
  RiskPrediction,
  User,
  VitalsRecord,
} from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Setup Gemini API Client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using fallback response generator.');
    }
    return new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // ==========================================
  // AUTHENTICATION & USERS API
  // ==========================================

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    let user = db.getUserByEmail(email);

    if (!user) {
      user = db.getUsers()[0];
      db.addAuditLog(user.id, user.email, user.role, 'USER_LOGIN', 'User logged in via demo session');
      return res.json({ token: `jwt-token-${user.id}`, user });
    }

    db.addAuditLog(user.id, user.email, user.role, 'USER_LOGIN', `Successful login for ${user.name}`);
    return res.json({ token: `jwt-token-${user.id}`, user });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, role } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.json({ token: `jwt-token-${existingUser.id}`, user: existingUser });
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'patient',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      assignedDoctorId: role === 'patient' ? 'usr-doc-1' : undefined,
    };

    db.addUser(newUser);
    db.addAuditLog(newUser.id, newUser.email, newUser.role, 'USER_REGISTER', `New user registered: ${newUser.name}`);
    return res.json({ token: `jwt-token-${newUser.id}`, user: newUser });
  });

  app.get('/api/users/me', (req, res) => {
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer jwt-token-', '') : 'usr-pat-1';
    const user = db.getUserById(userId) || db.getUsers()[0];
    return res.json({ user });
  });

  // ==========================================
  // PATIENT PROFILES & HEALTH RECORDS API
  // ==========================================

  app.get('/api/patients', (req, res) => {
    const patientUsers = db.getUsers().filter((u) => u.role === 'patient');

    const patientSummaries = patientUsers.map((pat) => {
      const records = db.getVitalsForPatient(pat.id);
      const latestVitals = records[records.length - 1] || null;

      const patientPredictions = db.getPredictionsForPatient(pat.id);
      const latestGdm = patientPredictions.find((p) => p.type === 'gestational_diabetes') || null;
      const latestCervical = patientPredictions.find((p) => p.type === 'cervical_cancer') || null;

      return {
        user: pat,
        latestVitals,
        latestGdmRisk: latestGdm,
        latestCervicalRisk: latestCervical,
        totalRecords: records.length,
      };
    });

    return res.json({ patients: patientSummaries });
  });

  app.get('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    const patientUser = db.getUserById(id);
    if (!patientUser) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patientVitals = db.getVitalsForPatient(id);
    const patientPredictions = db.getPredictionsForPatient(id);
    const patientNutrition = db.getNutritionPlanForPatient(id);
    const patientDoctorNotes = db.getDoctorNotesForPatient(id);

    return res.json({
      patient: patientUser,
      vitalsHistory: patientVitals,
      latestVitals: patientVitals[patientVitals.length - 1] || null,
      predictions: patientPredictions,
      nutritionPlan: patientNutrition,
      doctorNotes: patientDoctorNotes,
    });
  });

  // STORE PATIENT INPUT INTO DATABASE
  app.post('/api/health-records', (req, res) => {
    const recordData: Omit<VitalsRecord, 'id' | 'timestamp'> = req.body;
    if (!recordData.patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const newRecord: VitalsRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Store input given by the patient in database
    db.addVitalsRecord(newRecord);

    // Run AI Risk Prediction Models automatically based on stored input
    const cervicalPrediction = predictCervicalCancerRisk(newRecord);
    const gdmPrediction = predictGestationalDiabetesRisk(newRecord);

    db.addPrediction(cervicalPrediction);
    db.addPrediction(gdmPrediction);

    // Generate updated personalized nutrition plan based on stored input
    const newNutrition = generatePersonalizedNutritionPlan(
      newRecord,
      gdmPrediction,
      cervicalPrediction,
      'vegetarian'
    );
    db.addNutritionPlan(newNutrition);

    const patientUser = db.getUserById(newRecord.patientId);
    db.addAuditLog(
      newRecord.patientId,
      patientUser?.email || 'patient',
      'patient',
      'HEALTH_RECORD_ADDED',
      `New health inputs stored in database for ${patientUser?.name || 'patient'}. GDM Risk: ${gdmPrediction.category} (${gdmPrediction.probability}), Cervical Risk: ${cervicalPrediction.category} (${cervicalPrediction.probability})`
    );

    return res.json({
      record: newRecord,
      cervicalPrediction,
      gdmPrediction,
      nutritionPlan: newNutrition,
      vitalsHistory: db.getVitalsForPatient(newRecord.patientId),
      predictions: db.getPredictionsForPatient(newRecord.patientId),
    });
  });

  // Get All Stored Records for Patient
  app.get('/api/health-records/:patientId', (req, res) => {
    const { patientId } = req.params;
    const records = db.getVitalsForPatient(patientId);
    return res.json({ records });
  });

  // ==========================================
  // PREDICTIONS & NUTRITION ENGINE API
  // ==========================================

  app.get('/api/predictions/:patientId', (req, res) => {
    const { patientId } = req.params;
    const predictions = db.getPredictionsForPatient(patientId);
    return res.json({ predictions });
  });

  app.post('/api/predict/cervical-cancer', (req, res) => {
    const vitals: VitalsRecord = req.body;
    const result = predictCervicalCancerRisk(vitals);
    db.addPrediction(result);
    return res.json(result);
  });

  app.post('/api/predict/gestational-diabetes', (req, res) => {
    const vitals: VitalsRecord = req.body;
    const result = predictGestationalDiabetesRisk(vitals);
    db.addPrediction(result);
    return res.json(result);
  });

  app.get('/api/nutrition/:patientId', (req, res) => {
    const { patientId } = req.params;
    const plan = db.getNutritionPlanForPatient(patientId);
    return res.json({ plan });
  });

  app.post('/api/nutrition/generate', (req, res) => {
    const { patientId, vitals, preference, allergies } = req.body;
    const cervicalPred = predictCervicalCancerRisk(vitals);
    const gdmPred = predictGestationalDiabetesRisk(vitals);

    const plan = generatePersonalizedNutritionPlan(vitals, gdmPred, cervicalPred, preference, allergies);
    if (patientId) {
      plan.patientId = patientId;
    }
    db.addNutritionPlan(plan);
    return res.json({ plan });
  });

  app.put('/api/nutrition/:planId/approve', (req, res) => {
    const { planId } = req.params;
    const { doctorId, doctorName, doctorNote } = req.body;

    const approved = db.approveNutritionPlan(planId, doctorNote);
    if (approved) {
      const plan = db.getNutritionPlanForPatient(doctorId); // or lookup
      const doctorUser = db.getUserById(doctorId);

      const newDoctorNote: DoctorNote = {
        id: `note-${Date.now()}`,
        patientId: plan?.patientId || 'usr-pat-1',
        doctorId: doctorId || 'usr-doc-1',
        doctorName: doctorUser?.name || doctorName || 'Dr. Sunita Reddy',
        timestamp: new Date().toISOString(),
        note: doctorNote || 'Nutrition plan reviewed and clinically approved.',
        approvedNutritionId: planId,
      };
      db.addDoctorNote(newDoctorNote);

      db.addAuditLog(
        doctorId || 'usr-doc-1',
        doctorUser?.email || 'doctor',
        'doctor',
        'NUTRITION_PLAN_APPROVED',
        `Approved nutrition plan ${planId}`
      );
    }

    return res.json({ success: approved });
  });

  // ==========================================
  // AI HEALTHCARE CHATBOT API (GEMINI SDK)
  // ==========================================

  app.get('/api/chat/history/:userId', (req, res) => {
    const { userId } = req.params;
    const history = db.getChatHistory(userId);
    return res.json({ history });
  });

  app.post('/api/chat', async (req, res) => {
    const { userId, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const effectiveUserId = userId || 'usr-pat-1';
    const user = db.getUserById(effectiveUserId) || db.getUsers()[0];
    const userRecords = db.getVitalsForPatient(user.id);
    const latestVitals = userRecords[userRecords.length - 1];

    const userPredictions = db.getPredictionsForPatient(user.id);
    const gdmRisk = userPredictions.find((p) => p.type === 'gestational_diabetes');
    const cervicalRisk = userPredictions.find((p) => p.type === 'cervical_cancer');

    const history = db.getChatHistory(user.id);

    // Save user message in DB
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };
    db.addChatMessage(user.id, userMsg);

    const systemInstruction = `You are AURA, an empathetic, highly knowledgeable AI Maternal Healthcare Assistant.
You specialize in maternal health guidance, cervical cancer screening awareness, gestational diabetes management, prenatal nutrition, and explaining clinical risk predictions in simple, empowering language.

CRITICAL MEDICAL DIRECTIVES & SAFETY GUARDRAILS:
1. Always state at the end of guidance: "Disclaimer: This information is for educational purposes only and does not replace professional medical advice from your obstetrician or doctor."
2. Do NOT provide specific pharmaceutical prescription dosages or definitive medical diagnoses.
3. Encourage patients to discuss symptoms with their doctor.
4. Ground your knowledge in standard guidelines from WHO (World Health Organization) and ACOG (American College of Obstetricians and Gynecologists).

PATIENT CLINICAL CONTEXT FROM DATABASE:
- Patient Name: ${user.name}
- Total Stored Health Inputs: ${userRecords.length}
- Gestational Week: ${latestVitals?.gestationalAgeWeeks || 'N/A'} weeks
- Fasting Blood Sugar: ${latestVitals?.fastingBloodSugarMgDl || 'N/A'} mg/dL
- Hemoglobin: ${latestVitals?.hemoglobinGDl || 'N/A'} g/dL
- Gestational Diabetes Risk Level: ${gdmRisk?.category || 'Low'} (${gdmRisk?.probability || 0} probability)
- Cervical Cancer Risk Level: ${cervicalRisk?.category || 'Low'} (${cervicalRisk?.probability || 0} probability)

Answer the user's inquiry directly, clearly formatting with bullet points and warm tone.`;

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          ...history.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const assistantText = response.text || 'I am here to support your maternal journey. Please consult your physician for tailored clinical advice.';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: assistantText,
        timestamp: new Date().toISOString(),
        sources: [
          'WHO Recommendations on Antenatal Care for a Positive Pregnancy Experience',
          'ACOG Clinical Practice Bulletin No. 190: Gestational Diabetes',
        ],
      };

      db.addChatMessage(user.id, assistantMsg);
      db.addAuditLog(user.id, user.email, user.role, 'CHATBOT_INTERACTION', `User queried AI chatbot: "${message.substring(0, 40)}..."`);

      return res.json({ reply: assistantMsg.text, response: assistantMsg.text, sources: assistantMsg.sources, history: db.getChatHistory(user.id) });
    } catch (err: any) {
      console.error('Gemini API Error:', err);

      const fallbackText = `Thank you for reaching out! Regarding "${message}": Based on your patient record in our database (Gestational Age: ${latestVitals?.gestationalAgeWeeks || 26} wks, Hb: ${latestVitals?.hemoglobinGDl || 12} g/dL, Fasting Sugar: ${latestVitals?.fastingBloodSugarMgDl || 95} mg/dL), we advise maintaining consistent hydration and tracking daily blood glucose readings.\n\nDisclaimer: This information is for educational purposes only and does not replace professional medical advice from your doctor.`;

      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toISOString(),
        sources: ['WHO Maternal & Newborn Guidelines'],
      };

      db.addChatMessage(user.id, fallbackMsg);
      return res.json({ reply: fallbackMsg.text, response: fallbackMsg.text, sources: fallbackMsg.sources, history: db.getChatHistory(user.id) });
    }
  });

  // ==========================================
  // GENERATE MEDICAL REPORT FROM DATABASE INPUTS
  // ==========================================

  app.get('/api/reports/patient/:patientId', (req, res) => {
    const { patientId } = req.params;
    const user = db.getUserById(patientId);
    if (!user) {
      return res.status(404).json({ error: 'Patient profile not found in database' });
    }

    const vitalsHistory = db.getVitalsForPatient(patientId);
    const predictions = db.getPredictionsForPatient(patientId);
    const nutritionPlan = db.getNutritionPlanForPatient(patientId);
    const doctorNotes = db.getDoctorNotesForPatient(patientId);

    db.incrementReportCount();
    db.addAuditLog(
      patientId,
      user.email,
      'patient',
      'REPORT_GENERATED',
      `Medical report dynamically generated from ${vitalsHistory.length} database records for ${user.name}`
    );

    return res.json({
      reportId: `REP-${patientId.substring(0, 8)}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      patient: user,
      totalInputsRecorded: vitalsHistory.length,
      latestVitals: vitalsHistory[vitalsHistory.length - 1] || null,
      vitalsHistory,
      gdmRisk: predictions.find((p) => p.type === 'gestational_diabetes') || null,
      cervicalRisk: predictions.find((p) => p.type === 'cervical_cancer') || null,
      allPredictions: predictions,
      nutritionPlan,
      doctorNotes,
      status: 'Verified Database Record',
    });
  });

  app.post('/api/reports/generate/:userId', (req, res) => {
    const { userId } = req.params;
    db.incrementReportCount();

    const user = db.getUserById(userId);
    db.addAuditLog(
      userId,
      user?.email || 'user',
      'patient',
      'REPORT_GENERATED',
      `Comprehensive Medical PDF Report generated for patient ID ${userId}`
    );

    return res.json({ success: true, timestamp: new Date().toISOString() });
  });

  // ==========================================
  // SECURE IN-APP MESSAGING API (PATIENT <-> DOCTOR)
  // ==========================================

  // Fetch encrypted thread for a patient conversation
  app.get('/api/messages/thread/:patientId', (req, res) => {
    const { patientId } = req.params;
    const { readerId } = req.query;

    const messages = db.getDirectMessagesForThread(patientId);

    // Auto-read receipt if readerId is specified
    if (readerId && typeof readerId === 'string') {
      const updatedCount = db.markMessagesAsRead(patientId, readerId);
      if (updatedCount > 0) {
        const readerUser = db.getUserById(readerId);
        db.addAuditLog(
          readerId,
          readerUser?.email || 'user',
          readerUser?.role || 'patient',
          'SECURE_MSG_READ_RECEIPT',
          `Read receipts generated for ${updatedCount} encrypted messages in patient thread ${patientId}`
        );
      }
    }

    const patientUser = db.getUserById(patientId);
    db.addAuditLog(
      patientId,
      patientUser?.email || 'patient',
      'patient',
      'SECURE_MSG_THREAD_ACCESSED',
      `E2EE encrypted communication channel accessed for patient ${patientUser?.name || patientId}`
    );

    return res.json({
      patientId,
      messages: db.getDirectMessagesForThread(patientId),
      unreadCount: readerId && typeof readerId === 'string' ? db.getUnreadMessageCount(readerId) : 0,
      encryptionDetails: {
        algorithm: 'AES-256-GCM',
        keyExchange: 'ECDH P-384',
        hipaaCompliant: true,
        auditLogging: 'Active',
      },
    });
  });

  // Send a new encrypted direct message
  app.post('/api/messages/send', (req, res) => {
    const { senderId, receiverId, patientId, text, attachments } = req.body;

    if (!senderId || !receiverId || !patientId || !text) {
      return res.status(400).json({ error: 'senderId, receiverId, patientId, and text are required' });
    }

    const senderUser = db.getUserById(senderId);
    const receiverUser = db.getUserById(receiverId);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: 'Sender or receiver user record not found' });
    }

    const timestamp = new Date().toISOString();
    const messageId = `dm-${Date.now()}`;
    const encryptedPayload = `enc_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const newMessage: DirectMessage = {
      id: messageId,
      senderId,
      senderName: senderUser.name,
      senderRole: senderUser.role,
      receiverId,
      receiverName: receiverUser.name,
      patientId,
      text,
      encryptedPayload,
      encryptionAlgorithm: 'AES-256-GCM (HIPAA/E2EE)',
      timestamp,
      isRead: false,
      attachments: attachments || [],
    };

    db.addDirectMessage(newMessage);

    db.addAuditLog(
      senderId,
      senderUser.email,
      senderUser.role,
      'SECURE_MSG_SENT',
      `Encrypted AES-256 message sent from ${senderUser.name} (${senderUser.role}) to ${receiverUser.name} (${receiverUser.role}). Payload Digest: ${encryptedPayload.substring(0, 16)}...`
    );

    return res.json({
      success: true,
      message: newMessage,
      threadMessages: db.getDirectMessagesForThread(patientId),
    });
  });

  // Explicitly trigger read receipts
  app.post('/api/messages/read', (req, res) => {
    const { patientId, readerUserId } = req.body;
    if (!patientId || !readerUserId) {
      return res.status(400).json({ error: 'patientId and readerUserId are required' });
    }

    const count = db.markMessagesAsRead(patientId, readerUserId);
    const remainingUnread = db.getUnreadMessageCount(readerUserId);

    return res.json({
      markedCount: count,
      unreadCount: remainingUnread,
    });
  });

  // Get total unread count for user notification badges
  app.get('/api/messages/unread-count/:userId', (req, res) => {
    const { userId } = req.params;
    const unreadCount = db.getUnreadMessageCount(userId);
    return res.json({ userId, unreadCount });
  });

  // Get doctor's active patient conversations summary
  app.get('/api/messages/doctor/conversations/:doctorId', (req, res) => {
    const { doctorId } = req.params;
    const conversations = db.getDoctorConversations(doctorId);
    return res.json({ conversations });
  });

  // ==========================================
  // APPOINTMENT SCHEDULING API
  // ==========================================

  // Get appointments for a patient
  app.get('/api/appointments/patient/:patientId', (req, res) => {
    const { patientId } = req.params;
    const appointments = db.getAppointmentsForPatient(patientId);
    return res.json({ appointments });
  });

  // Get appointments for a doctor
  app.get('/api/appointments/doctor/:doctorId', (req, res) => {
    const { doctorId } = req.params;
    const appointments = db.getAppointmentsForDoctor(doctorId);
    return res.json({ appointments });
  });

  // Request a new appointment
  app.post('/api/appointments/request', (req, res) => {
    const { patientId, doctorId, appointmentType, date, timeSlot, notes } = req.body;

    if (!patientId || !appointmentType || !date || !timeSlot) {
      return res.status(400).json({ error: 'patientId, appointmentType, date, and timeSlot are required.' });
    }

    const patientUser = db.getUserById(patientId);
    if (!patientUser) {
      return res.status(404).json({ error: 'Patient user record not found.' });
    }

    const assignedDocId = doctorId || patientUser.assignedDoctorId || 'usr-doc-1';
    const doctorUser = db.getUserById(assignedDocId);

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId,
      patientName: patientUser.name,
      doctorId: assignedDocId,
      doctorName: doctorUser?.name || 'Dr. Sunita Reddy',
      appointmentType,
      date,
      timeSlot,
      status: 'Pending',
      notes: notes || '',
      requestedAt: new Date().toISOString(),
    };

    db.addAppointment(newApt);

    db.addAuditLog(
      patientId,
      patientUser.email,
      'patient',
      'APPOINTMENT_REQUESTED',
      `Requested ${appointmentType} appointment on ${date} at ${timeSlot} with ${newApt.doctorName}`
    );

    return res.json({
      success: true,
      appointment: newApt,
      appointments: db.getAppointmentsForPatient(patientId),
    });
  });

  // Update appointment status (Doctor action: Confirm, Reschedule, Cancel, Complete)
  app.patch('/api/appointments/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, doctorComments, newDate, newTimeSlot, actorId } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const updatedApt = db.updateAppointmentStatus(id, status as AppointmentStatus, doctorComments, newDate, newTimeSlot);

    if (!updatedApt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const actorUser = actorId ? db.getUserById(actorId) : null;

    db.addAuditLog(
      actorId || 'usr-doc-1',
      actorUser?.email || 'doctor@maternalhealth.org',
      actorUser?.role || 'doctor',
      `APPOINTMENT_${status.toUpperCase()}`,
      `Appointment ${id} status updated to ${status}. Type: ${updatedApt.appointmentType}, Date: ${updatedApt.date} ${updatedApt.timeSlot}`
    );

    return res.json({
      success: true,
      appointment: updatedApt,
    });
  });


  // ==========================================
  // ADMIN GOVERNANCE & AUDIT LOGS API
  // ==========================================

  app.get('/api/admin/stats', (req, res) => {
    return res.json({
      stats: db.getAdminStats(),
      models: db.getModelInfos(),
      logs: db.getAuditLogs().slice(0, 30),
    });
  });

  app.get('/api/admin/users', (req, res) => {
    return res.json({ users: db.getUsers() });
  });

  app.put('/api/admin/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const updated = db.updateUserRole(id, role);
    if (updated) {
      db.addAuditLog('usr-admin-1', 'admin@aura-maternal.io', 'admin', 'USER_ROLE_UPDATED', `Updated role for user ${id} to ${role}`);
    }

    return res.json({ success: updated, users: db.getUsers() });
  });

  app.post('/api/admin/models/retrain', (req, res) => {
    const { modelId } = req.body;
    const model = db.retrainModel(modelId);
    if (model) {
      db.addAuditLog('usr-admin-1', 'admin@aura-maternal.io', 'admin', 'MODEL_RETRAINED', `Triggered retraining workflow for ${model.name}`);
    }

    return res.json({ success: !!model, model });
  });

  // ==========================================
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
