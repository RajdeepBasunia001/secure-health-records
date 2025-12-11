import React, { useState } from 'react';
import { registerPatient, getBackendActor } from '../../canisterApi';
import { User, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';

const PatientRegistration = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        email: '',
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

        const age = Number(formData.age);
        const contact = Number(formData.contact);

        if (isNaN(age) || age < 0) {
            setError('Age must be a valid number');
            setLoading(false);
            return;
        }

        try {
            // Check for duplicate email logic moved to backend or handled here
            const actor = await getBackendActor();
            const allPatients = await actor.debug_list_patients();
            if (allPatients.some(p => p.email === formData.email)) {
                setError('Email already registered.');
                setLoading(false);
                return;
            }

            const result = await registerPatient(
                formData.name,
                age,
                formData.gender,
                formData.email,
                contact
            );

            if (result === 'ok') {
                onSuccess();
            } else {
                setError(result || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred during registration.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Patient Registration</h2>
                    <p className="text-gray-500 mt-2">Create your secure health profile to get started.</p>
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
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <User size={18} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input
                                type="number"
                                name="age"
                                required
                                min="0"
                                className="input-field"
                                placeholder="25"
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select
                                name="gender"
                                required
                                className="input-field"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                required
                                className="input-field pl-10"
                                placeholder="john@example.com"
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
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? 'Creating Profile...' : 'Complete Registration'}
                        {!loading && <CheckCircle size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PatientRegistration;
