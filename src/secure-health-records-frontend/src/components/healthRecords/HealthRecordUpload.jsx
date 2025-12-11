import React, { useState, useRef } from 'react';
import { getBackendActor } from '../../dfinity';
import { UploadCloud, File, CheckCircle, XCircle } from 'lucide-react';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
];
const CATEGORIES = ['General', 'Surgery', 'Immunization', 'Allergies'];

const HealthRecordUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    setError('');
    setFile(null);
    setPreviewUrl('');
    setSuccess(false);
    const selected = e.target.files[0];
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.');
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError('File is too large. Max size is 10MB.');
      return;
    }
    setFile(selected);
    if (selected.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl('');
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl('');
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    const principalString = localStorage.getItem('principal');
    if (!principalString) {
      setError('User not logged in. Please log in to upload records.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = Array.from(new Uint8Array(arrayBuffer));
      const actor = await getBackendActor();
      const result = await actor.upload_record(
        file.name,
        file.type,
        { [category]: null },
        uint8Array,
        ""
      );
      if (result && result.err) {
        setError('Upload failed: ' + result.err);
        setUploading(false);
        return;
      }
      setSuccess(true);
      window.dispatchEvent(new Event('health-records-updated'));
      setTimeout(() => setSuccess(false), 3000);
      handleRemove();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed: ' + (err.message || JSON.stringify(err)));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      inputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Record</h2>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              ref={inputRef}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">PDF, PNG, JPG (max 10MB)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {file && (
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between border border-gray-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  {file.type.startsWith('image/') && previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-gray-400">
                      <File size={20} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={handleRemove} className="text-gray-400 hover:text-rose-500 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm flex items-start gap-2">
              <XCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className={`w-full btn-primary flex items-center justify-center gap-2 py-3 ${uploading ? 'opacity-75 cursor-wait' : ''}`}
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>Upload Record</>
            )}
          </button>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-sm flex items-center justify-center gap-2">
              <CheckCircle size={18} />
              <span>Upload successful!</span>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default HealthRecordUpload;