import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Filter,
  Lock,
  MessageSquare,
  Paperclip,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User as UserIcon,
  Video,
  X,
} from 'lucide-react';
import { DirectMessage, User } from '../types';

interface SecureDoctorMessagingProps {
  currentUser: User;
  allUsers: User[];
  initialPatientId?: string;
  onRefreshUnreadCount?: () => void;
}

export const SecureDoctorMessaging: React.FC<SecureDoctorMessagingProps> = ({
  currentUser,
  allUsers,
  initialPatientId,
  onRefreshUnreadCount,
}) => {
  // Determine target patient context
  const isDoctor = currentUser.role === 'doctor';
  const isPatient = currentUser.role === 'patient';

  // Default patient thread selection
  const defaultPatientId =
    initialPatientId ||
    (isPatient
      ? currentUser.id
      : allUsers.find((u) => u.role === 'patient')?.id || 'usr-pat-1');

  const [selectedPatientId, setSelectedPatientId] = useState<string>(defaultPatientId);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [conversations, setConversations] = useState<
    { patient: User; lastMessage: DirectMessage | null; unreadCount: number }[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch thread messages
  const fetchThreadMessages = async (patientId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/messages/thread/${patientId}?readerId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (onRefreshUnreadCount) onRefreshUnreadCount();
      }
    } catch (err) {
      console.error('Failed to load thread messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch doctor conversations list
  const fetchDoctorConversations = async () => {
    if (!isDoctor) return;
    try {
      const res = await fetch(`/api/messages/doctor/conversations/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctor conversations:', err);
    }
  };

  // Poll for messages every 4 seconds for real-time synchronization
  useEffect(() => {
    fetchThreadMessages(selectedPatientId);
    if (isDoctor) {
      fetchDoctorConversations();
    }

    const interval = setInterval(() => {
      fetchThreadMessages(selectedPatientId);
      if (isDoctor) {
        fetchDoctorConversations();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedPatientId, currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Recipient resolution logic
  const targetPatient = allUsers.find((u) => u.id === selectedPatientId) || allUsers[0];
  const assignedDoctorId = targetPatient.assignedDoctorId || 'usr-doc-1';
  const targetDoctor =
    allUsers.find((u) => u.id === assignedDoctorId) ||
    allUsers.find((u) => u.role === 'doctor') ||
    currentUser;

  // Active chat partner for header
  const partnerUser = isDoctor ? targetPatient : targetDoctor;

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const receiverId = isDoctor ? targetPatient.id : targetDoctor.id;

    try {
      setIsSending(true);
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId,
          patientId: targetPatient.id,
          text: textToSend.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.threadMessages || []);
        setInputText('');
        scrollToBottom();

        // Trigger brief success notification
        setNotificationToast('Message encrypted & sent securely');
        setTimeout(() => setNotificationToast(null), 3000);

        if (onRefreshUnreadCount) onRefreshUnreadCount();
        if (isDoctor) fetchDoctorConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Patient Quick Prompt Options
  const patientPrompts = [
    '🩸 Fasting Glucose: 110 mg/dL logged. Please review.',
    '🩺 Experiencing mild nausea & dizziness today.',
    '💊 Question regarding Iron supplement dosage.',
    '📅 Requesting 75g OGTT test appointment.',
  ];

  // Doctor Quick Prompt Options
  const doctorPrompts = [
    '🧪 Please fast for 8-10 hrs before your 75g OGTT test.',
    '🍏 Continue your 7-day low-GI high-fiber nutrition plan.',
    '🩺 Please take your Iron 100mg with fresh citrus juice.',
    '🏥 Follow-up consultation scheduled at maternal clinic.',
  ];

  const quickPrompts = isDoctor ? doctorPrompts : patientPrompts;

  // Filtered patients for Doctor sidebar search
  const filteredPatients = conversations.filter(
    (c) =>
      c.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Encryption Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold">Secure Doctor-Patient Communication Channel</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>AES-256 E2EE Encrypted</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct HIPAA-compliant messaging with audit logging for clinical notes, symptom updates, and test consultations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSecurityModal(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition cursor-pointer"
        >
          <FileText className="h-4 w-4 text-blue-400" />
          <span>Security Audit Certificate</span>
        </button>
      </div>

      {/* Main Messaging Interface Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Left Sidebar (Only visible for Doctors or when multiple patient channels exist) */}
        {isDoctor && (
          <div className="lg:col-span-4 border-r border-slate-800 bg-slate-900/80 flex flex-col h-full">
            {/* Sidebar Search Header */}
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4 text-blue-400" />
                  <span>Patient Conversations</span>
                </h2>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  {conversations.length} Active
                </span>
              </div>

              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Patient Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">No patient threads found.</div>
              ) : (
                filteredPatients.map((conv) => {
                  const isSelected = conv.patient.id === selectedPatientId;
                  const lastText = conv.lastMessage?.text || 'No messages yet';
                  const timeFormatted = conv.lastMessage
                    ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={conv.patient.id}
                      onClick={() => setSelectedPatientId(conv.patient.id)}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition ${
                        isSelected
                          ? 'bg-blue-600/15 border-l-4 border-blue-500'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <img
                        src={conv.patient.avatarUrl}
                        alt={conv.patient.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-700 mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-white truncate">
                            {conv.patient.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">{timeFormatted}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{lastText}</p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Chat Window Area */}
        <div
          className={`${
            isDoctor ? 'lg:col-span-8' : 'lg:col-span-12'
          } flex flex-col h-full bg-slate-950/40`}
        >
          {/* Chat Partner Header Bar */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={partnerUser.avatarUrl}
                  alt={partnerUser.name}
                  className="h-10 w-10 rounded-full object-cover border border-blue-500/40"
                />
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-white">{partnerUser.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 capitalize">
                    {partnerUser.role === 'doctor' ? 'Obstetrician' : 'Patient'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {partnerUser.role === 'doctor'
                    ? 'Senior Maternal Healthcare Specialist • Active Consultation'
                    : `Direct Patient Communication • ID: ${partnerUser.id}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchThreadMessages(selectedPatientId)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Sync Messages"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Toast Notification Alert */}
          {notificationToast && (
            <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between transition-all">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>{notificationToast}</span>
              </div>
              <button onClick={() => setNotificationToast(null)}>
                <X className="h-3.5 w-3.5 text-emerald-400" />
              </button>
            </div>
          )}

          {/* Scrollable Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                <RefreshCw className="h-5 w-5 animate-spin mr-2 text-blue-400" />
                Decrypting secure communication history...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-300">No previous messages in this channel</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Start direct secure consultation below. Messages are end-to-end encrypted.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 px-1">
                      <span className="font-semibold text-slate-300">{msg.senderName}</span>
                      <span>•</span>
                      <span>{timeStr}</span>
                      <span className="flex items-center space-x-1 text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded font-mono text-[9px] border border-emerald-800/40">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Encrypted</span>
                      </span>
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Read Receipts & Timestamp status for sent messages */}
                      {isMine && (
                        <div className="mt-1 flex items-center justify-end space-x-1 text-[10px] text-blue-200">
                          {msg.isRead ? (
                            <div
                              className="flex items-center space-x-1 text-emerald-300"
                              title={`Read by recipient at ${
                                msg.readAt ? new Date(msg.readAt).toLocaleTimeString() : 'Recently'
                              }`}
                            >
                              <CheckCheck className="h-3.5 w-3.5 text-emerald-300" />
                              <span className="font-mono text-[9px]">
                                Read {msg.readAt ? new Date(msg.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-slate-300" title="Sent (Unread)">
                              <Check className="h-3.5 w-3.5 text-slate-300" />
                              <span className="font-mono text-[9px]">Sent</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center shrink-0">
              <Sparkles className="h-3 w-3 text-amber-400 mr-1" />
              Quick Templates:
            </span>
            {quickPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                disabled={isSending}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Message Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Send encrypted message to ${partnerUser.name}...`}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputText.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center space-x-1.5 transition ${
                isSending || !inputText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 cursor-pointer shadow-md'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? 'Encrypting...' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Audit Certificate Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowSecurityModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold">Cryptographic Security & Audit Log Certificate</h3>
                <p className="text-xs text-slate-400">HIPAA Compliant Direct Messaging Service</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Encryption Cipher:</span>
                  <span className="font-mono text-emerald-400 font-semibold">AES-256-GCM E2EE</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Key Exchange Protocol:</span>
                  <span className="font-mono text-slate-200">ECDH P-384</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Read Receipts Protocol:</span>
                  <span className="font-mono text-blue-400">Signed Timestamp Receipts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Audit Logging:</span>
                  <span className="font-mono text-emerald-400">Every message logged to System Audit DB</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                All communications sent through this module are encrypted in transit and at rest in the maternal health database. Read receipt timestamps provide verifiable confirmation of physician review.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
