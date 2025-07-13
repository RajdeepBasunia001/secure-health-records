import React, { useState, useRef } from 'react';
import './DoctorDashboard.css';
import './UploadNotes.css'; // NEW: import modern styles
import { getBackendActor } from '../../dfinity';
import { AuthClient } from '@dfinity/auth-client';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
];
const NOTE_CATEGORIES = ['Prescription', 'Consultation Note', 'Lab Report', 'Other'];
const NOTE_CATEGORY_VARIANTS = ['Prescription', 'ConsultationNote', 'LabReport', 'Other'];

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState(NOTE_CATEGORIES[0]);
  const [signature, setSignature] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Fetch uploaded notes/prescriptions for this doctor
  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const authClient = await AuthClient.create();
      const principal = authClient.getIdentity().getPrincipal(); // FIX: pass Principal object
      console.log('Doctor principal for fetch:', principal);
      const actor = await getBackendActor();
      const allRecords = await actor.get_records(principal);
      console.log('Fetched records:', allRecords);
      console.log('Category keys:', allRecords.map(r => Object.keys(r.category)[0]));
      // Filter for relevant categories
      const filtered = allRecords.filter(
        rec => NOTE_CATEGORY_VARIANTS.includes(Object.keys(rec.category)[0])
      );
      setRecords(filtered);
    } catch (err) {
      console.error('Error fetching records:', err);
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  React.useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, []);

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
    if (!signature.trim()) {
      setError('Please enter your digital signature.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      console.log('Uploading file:', file.name, 'Type:', file.type);
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = Array.from(new Uint8Array(arrayBuffer));
      const actor = await getBackendActor();
      let categoryVariant;
      switch (category) {
        case 'Prescription': categoryVariant = { Prescription: null }; break;
        case 'Consultation Note': categoryVariant = { ConsultationNote: null }; break;
        case 'Lab Report': categoryVariant = { LabReport: null }; break;
        case 'Other': categoryVariant = { Other: null }; break;
        default: categoryVariant = { Other: null };
      }
      console.log('Uploading with:', {
        name: file.name,
        type: file.type,
        categoryVariant,
        uint8ArrayLength: uint8Array.length,
        signature
      });
      const result = await actor.upload_record(
        file.name,
        file.type,
        categoryVariant,
        uint8Array,
        signature
      );
      console.log('Upload result:', result);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      handleRemove();
      setSignature('');
      fetchRecords(); // Refresh list after upload
    } catch (err) {
      console.error('Error uploading record:', err);
      setError('Upload failed: ' + (err.message || JSON.stringify(err)));
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
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
  const handleAreaClick = () => {
    inputRef.current.click();
  };

  // Helper to format date
  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleString();
  }

  // Helper to get category label
  function getCategoryLabel(catObj) {
    const key = Object.keys(catObj)[0];
    switch (key) {
      case 'Prescription': return 'Prescription';
      case 'ConsultationNote': return 'Consultation Note';
      case 'LabReport': return 'Lab Report';
      case 'Other': return 'Other';
      default: return key;
    }
  }

  // Download/view handler
  const handleDownload = async (recordId, fileName) => {
    try {
      const actor = await getBackendActor();
      const dataOpt = await actor.get_record_data(recordId);
      if (dataOpt && dataOpt.length > 0) {
        const blob = new Blob([new Uint8Array(dataOpt[0])]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Failed to download file.');
    }
  };

  return (
    <div className="doctor-upload-notes">
      <div className="doctor-upload-notes__upload-card-wrapper">
        <div className="doctor-upload-notes__upload-card">
          <h3>Upload Notes / Prescriptions</h3>
          <form onSubmit={handleSubmit} className="doctor-upload-notes__upload-form">
            <label className={`doctor-upload-notes__drag-drop-area${dragActive ? ' doctor-upload-notes__drag-active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={e => {
                if (e.target === e.currentTarget) handleAreaClick();
              }}
            >
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                ref={inputRef}
                style={{ display: 'none' }}
              />
              <div className="doctor-upload-notes__drag-drop-content">
                <span className="doctor-upload-notes__upload-icon">📝</span>
                <span className="doctor-upload-notes__drag-drop-text">
                  Drag & drop a file here, or <span className="doctor-upload-notes__browse-link">browse</span>
                </span>
                <span className="doctor-upload-notes__drag-drop-subtext">PDF, PNG, JPG, JPEG (max 10MB)</span>
              </div>
            </label>
            <div className="doctor-upload-notes__category-select">
              <label>Category:</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                {NOTE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="doctor-upload-notes__signature-field">
              <label>Doctor's Digital Signature:</label>
              <input
                type="text"
                value={signature}
                onChange={e => setSignature(e.target.value)}
                placeholder="Enter your name as signature"
                required
              />
            </div>
            {error && <div className="doctor-upload-notes__upload-error">{error}</div>}
            {file && (
              <div className="doctor-upload-notes__upload-preview doctor-upload-notes__animated-fade-in">
                {file.type.startsWith('image/') ? (
                  <img src={previewUrl} alt="Preview" className="doctor-upload-notes__upload-img-preview" />
                ) : file.type === 'application/pdf' ? (
                  <div className="doctor-upload-notes__pdf-preview">
                    <span role="img" aria-label="pdf">📄</span> {file.name}
                  </div>
                ) : null}
                <button type="button" className="doctor-upload-notes__remove-btn" onClick={handleRemove}>Remove</button>
              </div>
            )}
            <button type="submit" className="doctor-upload-notes__upload-btn" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            {success && (
              <div className="doctor-upload-notes__upload-success-animated">
                <span className="doctor-upload-notes__success-checkmark">✔️</span> File uploaded successfully!
              </div>
            )}
          </form>
        </div>
      </div>
      <h4>Your Uploaded Notes/Prescriptions</h4>
      {loadingRecords ? (
        <div className="doctor-upload-notes__notes-loading">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="doctor-upload-notes__notes-empty">No notes or prescriptions uploaded yet.</div>
      ) : (
        <div className="doctor-upload-notes__notes-table-card">
          <table className="doctor-upload-notes__notes-table-modern">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Category</th>
                <th>Uploaded At</th>
                <th>Digital Signature</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => (
                <tr key={rec.id} className="doctor-upload-notes__notes-row-fadein" style={{ animationDelay: `${idx * 60}ms` }}>
                  <td>{rec.name}</td>
                  <td>{getCategoryLabel(rec.category)}</td>
                  <td>{formatDate(rec.uploaded_at)}</td>
                  <td>{rec.digital_signature || ''}</td>
                  <td>
                    <button type="button" className="doctor-upload-notes__download-btn-animated" onClick={() => handleDownload(rec.id, rec.name)} title="Download">
                      <span className="doctor-upload-notes__download-icon">⬇️</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UploadNotes; 