import React, { useState, useEffect } from 'react';
import { createConsentRequest, fetchAllDoctors } from '../../../canisterApi';
import { getBackendActor } from '../../../dfinity';
import { Search, FileText, CheckCircle } from 'lucide-react';

const PatientShare = ({ principal }) => {
    const [doctors, setDoctors] = useState([]);
    const [records, setRecords] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [duration, setDuration] = useState(3600 * 24); // 1 Day default
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function init() {
            try {
                const docs = await fetchAllDoctors();
                setDoctors(docs);
                const actor = await getBackendActor();
                const myRecords = await actor.get_records(principal);
                setRecords(myRecords);
            } catch (e) {
                console.error(e);
            }
        }
        if (principal) init();
    }, [principal]);

    const handleFileToggle = (id) => {
        if (selectedFiles.includes(id)) {
            setSelectedFiles(selectedFiles.filter(f => f !== id));
        } else {
            setSelectedFiles([...selectedFiles, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!selectedDoc) {
            setError('Please select a doctor.');
            setLoading(false);
            return;
        }
        if (selectedFiles.length === 0) {
            setError('Please select at least one file to share.');
            setLoading(false);
            return;
        }

        try {
            // Prepare shared_files struct
            const filesPayload = selectedFiles.map(fid => ({
                file_id: BigInt(fid), // Ensure BigInt for Nat64
                permission: 'view',
                duration: BigInt(duration)
            }));

            // Generate a dummy token to satisfy backend constraint (temporary)
            const consentToken = `token-${Date.now()}`;

            const result = await createConsentRequest(
                selectedDoc,
                notes || 'Access granted by patient',
                consentToken,
                filesPayload
            );

            if (result === 'ok') {
                setSuccess('Access granted successfully! The doctor can now view the selected records.');
                setSelectedFiles([]);
                setNotes('');
                setSelectedDoc('');
            } else {
                setError(result);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to grant access. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Share Records</h2>
            <p className="text-gray-500 mb-8">Grant temporary access to doctors securely.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Select Doctor */}
                <div className="card">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">1</span>
                        Select Doctor
                    </h3>
                    <div className="relative">
                        <select
                            className="input-field appearance-none cursor-pointer"
                            value={selectedDoc}
                            onChange={e => setSelectedDoc(e.target.value)}
                        >
                            <option value="">-- Choose a Doctor --</option>
                            {doctors.map(doc => (
                                <option key={doc.health_id} value={doc.health_id}>
                                    Dr. {doc.name} ({doc.speciality}) - {doc.health_id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Step 2: Select Files */}
                <div className="card">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</span>
                        Select Records
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {records.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No records uploaded yet.</p>
                        ) : (
                            records.map(rec => (
                                <label key={Number(rec.id)} className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${selectedFiles.includes(rec.id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                        checked={selectedFiles.includes(rec.id)}
                                        onChange={() => handleFileToggle(rec.id)}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{rec.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{Object.keys(rec.category || {})[0]} • {new Date(Number(rec.uploaded_at) / 1000000).toLocaleDateString()}</p>
                                    </div>
                                    <FileText size={18} className="text-gray-400" />
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* Step 3: Duration & Confirm */}
                <div className="card bg-gray-50 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <select className="input-field" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                                <option value={3600}>1 Hour</option>
                                <option value={3600 * 24}>24 Hours</option>
                                <option value={3600 * 24 * 7}>7 Days</option>
                                <option value={3600 * 24 * 30}>30 Days</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Optional Note</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Reason for access..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            {selectedFiles.length} records selected
                        </div>
                        <button
                            type="submit"
                            className="btn-primary flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Grant Access'}
                            <CheckCircle size={18} />
                        </button>
                    </div>

                    {success && <div className="mt-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg text-sm">{success}</div>}
                    {error && <div className="mt-4 p-3 bg-rose-100 text-rose-700 rounded-lg text-sm">{error}</div>}
                </div>
            </form>
        </div>
    );
};

export default PatientShare;
