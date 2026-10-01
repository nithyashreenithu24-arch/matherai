import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Clock3,
  RefreshCw,
  AlertCircle,
  XCircle,
  FileText,
  User as UserIcon,
  Stethoscope,
  Send,
  CalendarCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Appointment, AppointmentStatus, User } from '../types';

interface AppointmentSchedulerProps {
  currentUser: User;
  allUsers: User[];
  onAppointmentUpdated?: () => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  currentUser,
  allUsers,
  onAppointmentUpdated,
}) => {
  const isDoctor = currentUser.role === 'doctor';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Request Form state
  const [appointmentType, setAppointmentType] = useState<Appointment['appointmentType']>('75g OGTT Test');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:30 AM');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Doctor Action State
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [doctorActionStatus, setDoctorActionStatus] = useState<AppointmentStatus>('Confirmed');
  const [doctorComment, setDoctorComment] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const url = isDoctor
        ? `/api/appointments/doctor/${currentUser.id}`
        : `/api/appointments/patient/${currentUser.id}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser.id, currentUser.role]);

  // Request New Appointment
  const handleRequestAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentUser.id,
          doctorId: currentUser.assignedDoctorId || 'usr-doc-1',
          appointmentType,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setShowRequestModal(false);
        setNotes('');
        setSuccessToast(`Appointment request submitted for ${selectedDate} (${selectedTimeSlot})`);
        setTimeout(() => setSuccessToast(null), 4000);
        if (onAppointmentUpdated) onAppointmentUpdated();
      }
    } catch (err) {
      console.error('Error requesting appointment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status (Doctor or Patient Cancellation)
  const handleUpdateStatus = async (
    aptId: string,
    newStatus: AppointmentStatus,
    comment?: string,
    newDate?: string,
    newTimeSlot?: string
  ) => {
    try {
      const res = await fetch(`/api/appointments/${aptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          doctorComments: comment,
          newDate: newDate || undefined,
          newTimeSlot: newTimeSlot || undefined,
          actorId: currentUser.id,
        }),
      });

      if (res.ok) {
        setEditingAptId(null);
        setDoctorComment('');
        fetchAppointments();
        setSuccessToast(`Appointment status updated to ${newStatus}`);
        setTimeout(() => setSuccessToast(null), 4000);
        if (onAppointmentUpdated) onAppointmentUpdated();
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock3 className="h-3.5 w-3.5 animate-pulse" />
            <span>Pending Doctor Review</span>
          </span>
        );
      case 'Rescheduled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Rescheduled</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Completed</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter === 'All') return true;
    return apt.status === statusFilter;
  });

  const availableTimeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:30 PM',
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Maternal Clinical Appointments</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-300 dark:border-blue-800">
                {appointments.length} Total
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isDoctor
                ? 'Review and manage patient appointment requests, OGTT testing dates, and prenatal consults.'
                : 'Schedule, track, and manage your clinical consultations & specialized lab tests.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isDoctor && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-2 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Request Appointment</span>
            </button>
          )}

          <button
            onClick={fetchAppointments}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center mr-1 shrink-0">
          <Filter className="h-3.5 w-3.5 mr-1" /> Status Filter:
        </span>
        {['All', 'Pending', 'Confirmed', 'Rescheduled', 'Cancelled', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer shrink-0 ${
              statusFilter === status
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl space-y-2">
            <CalendarIcon className="h-8 w-8 mx-auto text-slate-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No appointments match the selected filter ({statusFilter})
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isDoctor
                ? 'Patient appointment requests will appear here when submitted.'
                : 'Click "Request Appointment" above to book your next lab test or doctor consultation.'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 transition hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Top Row: Type & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {apt.appointmentType}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>{isDoctor ? `Patient: ${apt.patientName}` : `Doctor: ${apt.doctorName}`}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">ID: {apt.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">{getStatusBadge(apt.status)}</div>
              </div>

              {/* Middle Row: Date, Time & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <CalendarIcon className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.date}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Slot</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.timeSlot}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <FileText className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Clinical Reason / Notes</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate block">
                      {apt.notes || 'No specific notes provided.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Doctor Comments Section if present */}
              {apt.doctorComments && (
                <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Doctor Instructions / Review Notes:</span>
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 pl-4">{apt.doctorComments}</p>
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-mono">
                  Requested: {new Date(apt.requestedAt).toLocaleString()}
                </span>

                {/* Doctor Action Controls */}
                {isDoctor && editingAptId !== apt.id && (
                  <div className="flex items-center space-x-2">
                    {apt.status === 'Pending' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            apt.id,
                            'Confirmed',
                            'Appointment request confirmed by obstetrician. Please arrive 10 minutes prior.'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Confirm Request
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingAptId(apt.id);
                        setDoctorActionStatus(apt.status);
                        setDoctorComment(apt.doctorComments || '');
                        setRescheduleDate(apt.date);
                        setRescheduleTime(apt.timeSlot);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold text-xs transition cursor-pointer"
                    >
                      Manage / Update Status
                    </button>
                  </div>
                )}

                {/* Doctor Inline Management Panel */}
                {isDoctor && editingAptId === apt.id && (
                  <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-300 dark:border-slate-700 space-y-3 mt-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Update Appointment Status & Clinical Instructions
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Status
                        </label>
                        <select
                          value={doctorActionStatus}
                          onChange={(e) => setDoctorActionStatus(e.target.value as AppointmentStatus)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>

                      {doctorActionStatus === 'Rescheduled' && (
                        <>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              New Date
                            </label>
                            <input
                              type="date"
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                              New Time Slot
                            </label>
                            <select
                              value={rescheduleTime}
                              onChange={(e) => setRescheduleTime(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                            >
                              {availableTimeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Doctor Notes / Instructions for Patient
                      </label>
                      <textarea
                        value={doctorComment}
                        onChange={(e) => setDoctorComment(e.target.value)}
                        placeholder="Provide prep instructions (e.g., fasting requirements for OGTT)..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingAptId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            apt.id,
                            doctorActionStatus,
                            doctorComment,
                            doctorActionStatus === 'Rescheduled' ? rescheduleDate : undefined,
                            doctorActionStatus === 'Rescheduled' ? rescheduleTime : undefined
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {/* Patient Actions (Cancel request if pending) */}
                {!isDoctor && apt.status === 'Pending' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(apt.id, 'Cancelled', 'Cancelled by patient request.')
                    }
                    className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/20 transition cursor-pointer"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Appointment Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <CalendarCheck className="h-5 w-5 text-blue-500" />
                <span>Request Clinical Consultation</span>
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Appointment Consultation Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="75g OGTT Test">75g Oral Glucose Tolerance Test (Gestational Diabetes Screening)</option>
                  <option value="High-Risk Prenatal Checkup">High-Risk Prenatal Checkup (28-32 Weeks)</option>
                  <option value="Cervical Screening Follow-up">Cervical Screening & Colposcopy Consultation</option>
                  <option value="Routine Ultrasound">Routine Fetal Doppler Ultrasound</option>
                  <option value="General Consultation">General Obstetric Consultation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  >
                    {availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Symptoms or Specific Requests (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe any symptoms, fasting questions, or notes for Dr. Sunita Reddy..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-[11px] text-blue-800 dark:text-blue-300 flex items-center space-x-2">
                <Clock3 className="h-4 w-4 shrink-0 text-blue-500" />
                <span>
                  Your requested appointment will be sent directly to Dr. Sunita Reddy for review. You will receive real-time status updates here.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
