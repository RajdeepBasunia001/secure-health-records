import React, { useState, useEffect } from 'react';
import { getPatientAppointments } from '../../../canisterApi';
import { Calendar, Clock, User, CheckCircle, XCircle, Clock3 } from 'lucide-react';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const list = await getPatientAppointments();
            // Sort by recent
            setAppointments(list.sort((a, b) => Number(b.created_at) - Number(a.created_at)));
        } catch (e) {
            console.error("Failed to load appointments", e);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Confirmed</span>;
            case 'denied':
                return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Denied</span>;
            default:
                return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock3 size={12} /> Pending</span>;
        }
    };

    // Helper to parse JSON details
    const parseDetails = (jsonStr) => {
        try {
            const parsed = JSON.parse(jsonStr);
            // Reformat ISO datetime to nice string
            const date = new Date(parsed.datetime);
            return {
                reason: parsed.reason,
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        } catch (e) {
            return { reason: jsonStr, date: 'Unknown', time: '' };
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
                <button onClick={loadAppointments} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Refresh</button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No appointments yet</h3>
                    <p className="text-gray-500 mt-1">Book your first consultation with a specialist.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {appointments.map(apt => {
                        const { reason, date, time } = parseDetails(apt.details);
                        return (
                            <div key={Number(apt.id)} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                                            {date.split('/')[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-lg">Dr. {apt.provider_health_id}</h4> {/* Ideally we'd fetch Doc Name map */}
                                            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                                <Clock size={14} /> {time} • {reason}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(apt.status)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
