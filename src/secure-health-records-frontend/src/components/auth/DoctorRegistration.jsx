import React, { useState } from 'react';
import { registerDoctor, fetchAllDoctors } from '../../canisterApi';
import { User, Mail, Phone, Stethoscope, CheckCircle, AlertCircle } from 'lucide-react';

const SPECIALITIES = [
    'Cardiology', 'Dermatology', 'Orthopedics', 'Neurology',
    'Oncology', 'Psychiatry', 'Radiology', 'Pathology', 'Gastroenterology'
];

const DoctorRegistration = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        speciality: '',
        contact: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const contact = Number(formData.contact);
        if (isNaN(contact) || contact < 0) {
            setError('Contact must be a valid number');
            setLoading(false);
            return;
        }

        try {
            const doctors = await fetchAllDoctors();
            if (doctors.some(d => d.email === formData.email)) {
                setError('Email already registered.');
                setLoading(false);
                return;
            }

            const result = await registerDoctor(
                formData.name,
                formData.email,
                formData.speciality,
                contact
            );

            // Result is Health ID string on success (e.g. DOC-000001) or error string?
            // Lib.rs says it returns String (Health ID). It doesn't seem to return Result type based on line 615 of lib.rs?
            // Wait, register_doctor returns String (the ID).
            // But if it fails?
            // It pushes to Vec. It assumes success.

            if (result && result.startsWith('DOC-')) {
                onSuccess();
            } else {
                setError('Registration failed: ' + result);
            }
        } catch (err) {
            console.error(err);
            setError('Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <Stethoscope size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Doctor Registration</h2>
                    <p className="text-gray-500 mt-2">Join the secure network to manage patient care.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                required
                                className="input-field pl-10"
                                placeholder="Dr. Jane Smith"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <User size={18} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                        <select
                            name="speciality"
                            required
                            className="input-field"
                            value={formData.speciality}
                            onChange={handleChange}
                        >
                            <option value="">Select Speciality</option>
                            {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                required
                                className="input-field pl-10"
                                placeholder="doctor@hospital.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <div className="relative">
                            <input
                                type="tel"
                                name="contact"
                                required
                                className="input-field pl-10"
                                placeholder="1234567890"
                                value={formData.contact}
                                onChange={handleChange}
                            />
                            <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100 flex items-start gap-2">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? 'Registering...' : 'Register'}
                        {!loading && <CheckCircle size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DoctorRegistration;
