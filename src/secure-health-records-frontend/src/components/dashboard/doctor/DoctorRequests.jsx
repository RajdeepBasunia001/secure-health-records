import React, { useEffect, useState } from 'react';
import { getAppointmentsForProvider, getConsentRequestsForProvider, respondAppointmentRequest } from '../../../canisterApi';
import { Check, X, FileText, Calendar, User, Clock } from 'lucide-react';

const DoctorRequests = ({ profile }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    const fetchRequests = async () => {
        if (!profile?.health_id) return;
        setLoading(true);
        try {
            // Concurrent fetch
            const [appointments, consents] = await Promise.all([
                getAppointmentsForProvider(profile.health_id),
                getConsentRequestsForProvider(profile.health_id)
            ]);

            // Merge and standardize
            // Backend structs are same: AppointmentRequest
            const merged = [...appointments, ...consents];

            // Sort by status (pending first) then date desc
            const sorted = merged.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return Number(b.created_at) - Number(a.created_at);
            });
            setRequests(sorted);
        } catch (e) {
            console.error("Failed to fetch requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 10000);
        return () => clearInterval(interval);
    }, [profile]);

    const handleResponse = async (reqId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

        setProcessing(reqId);
        try {
            // action: 'approve' | 'reject'
            const result = await respondAppointmentRequest(reqId, action === 'approve' ? 'approved' : 'rejected');

            // Backend returns Result<(), String> -> if ok, it is null/undefined in JS usually if using default bindings, 
            // OR checks for 'ok' property if using advanced bindings. 
            // Our backend returns Result. Let's assume common binding pattern: { ok: null } or { err: "msg" }
            // Actually, based on previous code usage, we treated 'ok' string. 
            // Let's re-verify: respond_appointment_request returns Result<(), String>.
            // In JS: { ok: null } or { err: "..." }

            // Wait, previous code checked `if (result === 'ok')`. That looks like legacy string return.
            // My backend code: `-> Result<(), String>`.
            // bindings: `ok` field exists on success.

            if (result && 'ok' in result) {
                // Optimistic update
                const newStatus = action === 'approve' ? 'approved' : 'denied'; // "denied" is what backend sets for false
                setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
            } else {
                alert('Failed: ' + (result?.err || 'Unknown error'));
            }
        } catch (e) {
            console.error(e);
            alert('Error updating request');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-800';
            case 'approved': return 'bg-emerald-100 text-emerald-800';
            case 'denied': return 'bg-rose-100 text-rose-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // Helper to parse details
    const parseDetails = (reqType, detailsStr) => {
        if (reqType === 'appointment') {
            try {
                const p = JSON.parse(detailsStr);
                return `Reason: ${p.reason} @ ${new Date(p.datetime).toLocaleString()}`;
            } catch { return detailsStr; }
        }
        return detailsStr; // Consent details usually plain text
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Inbox & Requests</h2>
                <button onClick={fetchRequests} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    Refresh
                </button>
            </div>

            {loading && requests.length === 0 && (
                <div className="flex justify-center p-12 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {!loading && requests.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Calendar size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                    <p className="text-gray-500 mt-1">New appointments and consent requests will appear here.</p>
                </div>
            )}

            <div className="space-y-4">
                {requests.map(req => {
                    const reqId = req.id; // Backend uses 'id', not 'request_id' as per struct
                    return (
                        <div key={Number(reqId)} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-indigo-100 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${req.request_type === 'consent' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {req.request_type === 'consent' ? <FileText size={20} /> : <Calendar size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {req.request_type === 'consent' ? 'Record Access Request' : 'Appointment Request'}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                                        <span className="flex items-center gap-1"><User size={14} /> Patient: {req.patient?.toText ? req.patient.toText().slice(0, 8) + '...' : 'Unknown'}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(Number(req.created_at) / 1000000).toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono">
                                        {parseDetails(req.request_type, req.details)}
                                    </p>
                                    {req.request_type === 'consent' && req.shared_files && req.shared_files.length > 0 && (
                                        <div className="mt-2 text-xs text-indigo-600 font-medium">
                                            📎 Includes {req.shared_files.length} shared records
                                        </div>
                                    )}
                                </div>
                            </div>

                            {req.status === 'pending' && (
                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                    <button
                                        onClick={() => handleResponse(reqId, 'approve')}
                                        disabled={processing === reqId}
                                        className="flex-1 md:flex-none bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm shadow-sm"
                                    >
                                        {processing === reqId ? '...' : <><Check size={16} /> Approve</>}
                                    </button>
                                    <button
                                        onClick={() => handleResponse(reqId, 'reject')}
                                        disabled={processing === reqId}
                                        className="flex-1 md:flex-none bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-lg font-medium hover:bg-rose-50 flex items-center justify-center gap-2 text-sm shadow-sm"
                                    >
                                        <X size={16} /> Deny
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default DoctorRequests;
