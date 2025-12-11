import React, { useState, useEffect } from 'react';
import { fetchAllDoctors, requestAppointment } from '../../../canisterApi';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        doctorHealthId: '',
        date: '',
        time: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        try {
            const list = await fetchAllDoctors();
            setDoctors(list);
        } catch (e) {
            console.error("Failed to load doctors", e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const datetime = `${formData.date}T${formData.time}`;
            const result = await requestAppointment(
                formData.doctorHealthId,
                formData.reason,
                datetime
            );

            if (result === 'ok') {
                setSuccess(true);
                setFormData({ ...formData, reason: '', date: '', time: '' });
                // Reset success msg after 3s
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="text-indigo-600" />
                Book Appointment
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                        <select
                            required
                            className="input-field"
                            value={formData.doctorHealthId}
                            onChange={e => setFormData({ ...formData, doctorHealthId: e.target.value })}
                        >
                            <option value="">Choose a specialist...</option>
                            {doctors.map(doc => (
                                <option key={doc.health_id} value={doc.health_id}>
                                    {doc.name} ({doc.speciality})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                required
                                className="input-field"
                                value={formData.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                required
                                className="input-field"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                        <textarea
                            required
                            rows="3"
                            className="input-field"
                            placeholder="Describe your symptoms or reason for consultation..."
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        ></textarea>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100 flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100 flex items-center gap-2">
                            <CheckCircle size={16} />
                            Appointment requested successfully!
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !formData.doctorHealthId}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {loading ? 'Submitting...' : 'Request Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookAppointment;
