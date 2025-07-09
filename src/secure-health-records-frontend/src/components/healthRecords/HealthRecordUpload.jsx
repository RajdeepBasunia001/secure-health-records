import React, { useState, useRef } from 'react';
import './HealthRecordUpload.css';
import { getBackendActor } from '../../dfinity';

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
      const actor = await getBackendActor(); // FIX: await the actor
      const result = await actor.upload_record(
        file.name,
        file.type,
        { [category]: null },
        uint8Array,
        "" // digital_signature: empty string for patient uploads
      );
      if (result && result.err) {
        setError('Upload failed: ' + result.err);
        setUploading(false);
        return;
      }
      setSuccess(true);
      window.dispatchEvent(new Event('health-records-updated'));
      setTimeout(() => setSuccess(false), 2000);
      handleRemove();
    } catch (err) {
      console.error('Upload failed:', err);
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

  return (
    <div className="health-record-upload modern-upload-card">
      <h3>Upload Health Record</h3>
      <form onSubmit={handleSubmit} className="upload-form">
        <label className={`drag-drop-area${dragActive ? ' drag-active' : ''}`}
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
          <div className="drag-drop-content">
            <span className="upload-icon">📄</span>
            <span className="drag-drop-text">
              Drag & drop a file here, or <span className="browse-link">browse</span>
            </span>
            <span className="drag-drop-subtext">PDF, PNG, JPG, JPEG (max 10MB)</span>
          </div>
        </label>
        <div className="category-select">
          <label>Category:</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {error && <div className="upload-error">{error}</div>}
        {file && (
          <div className="upload-preview animated-fade-in">
            {file.type.startsWith('image/') ? (
              <img src={previewUrl} alt="Preview" className="upload-img-preview" />
            ) : file.type === 'application/pdf' ? (
              <div className="pdf-preview">
                <span role="img" aria-label="pdf">📄</span> {file.name}
              </div>
            ) : null}
            <button type="button" onClick={handleRemove} className="remove-btn">Remove</button>
          </div>
        )}
        <button type="submit" className="upload-btn" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {success && (
          <div className="upload-success">
            <span className="success-icon">✔️</span> File uploaded successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default HealthRecordUpload; 