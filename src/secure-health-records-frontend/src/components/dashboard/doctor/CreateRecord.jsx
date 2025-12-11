import React, { useState } from 'react';
import { addPatientRecord } from '../../../canisterApi'; // You need to ensure this is exported
import { FilePlus, Save, X, Check } from 'lucide-react';

const CreateRecord = ({ patientPrincipal, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Prescription',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const CATEGORIES = [
        'Prescription', 'ConsultationNote', 'LabReport', 'General'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientPrincipal) {
            setError('Patient principal is missing');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // Convert content to Blob/Vec<u8>
            const encoder = new TextEncoder();
            const data = encoder.encode(formData.content);
            // In a real app we might want to upload PDF, but for text notes/prescriptions simple text/json is fine.
            // Let's assume we save it as a .txt file for now or .json

            // Wait, addPatientRecord expects Vec<u8> (Uint8Array in JS)
            const result = await addPatientRecord(
                patientPrincipal,
                formData.name,
                "text/plain", // file_type
                formData.category,
                data
            );

            if (result.startsWith('ok')) {
                onSuccess();
            } else {
                setError(result);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to create record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FilePlus size={20} className="text-indigo-600" />
                    Add Medical Record
                </h3>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Record Title</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="e.g., Checkup Summary"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        className="input-field"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content / Notes / Prescription</label>
                    <textarea
                        required
                        rows="6"
                        className="input-field font-mono text-sm"
                        placeholder="Enter clinical notes or prescription details here..."
                        value={formData.content}
                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                </div>

                {error && (
                    <div className="text-sm text-rose-600 bg-rose-50 p-2 rounded">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Record</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRecord;
