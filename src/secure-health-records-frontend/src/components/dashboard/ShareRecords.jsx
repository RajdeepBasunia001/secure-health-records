import React, { useState } from 'react';
import './ShareRecords.css';

import { getBackendActor } from '../../dfinity';
import { usePatientRecords } from '../healthRecords/usePatientRecords';
import SHA256 from 'crypto-js/sha256';
import { AuthClient } from '@dfinity/auth-client';

// Mock doctor data (replace with backend data later)
const mockDoctors = [
  {
    healthId: 'health-abc',
    name: 'Dr. Alice Smith',
    specialty: 'Cardiology',
    contact: 'alice@example.com',
  },
  {
    healthId: 'health-def',
    name: 'Dr. Bob Jones',
    specialty: 'Dermatology',
    contact: 'bob@example.com',
  },
  {
    healthId: 'health-xyz',
    name: 'Dr. Carol White',
    specialty: 'Pediatrics',
    contact: 'carol@example.com',
  },
  // Added new specialties
  {
    healthId: 'health-neuro',
    name: 'Dr. David Lee',
    specialty: 'Neurology',
    contact: 'david.lee@neuroclinic.com',
  },
  {
    healthId: 'health-psych',
    name: 'Dr. Emily Chen',
    specialty: 'Psychiatry',
    contact: 'emily.chen@mindhealth.com',
  },
  {
    healthId: 'health-radio',
    name: 'Dr. Frank Patel',
    specialty: 'Radiology',
    contact: 'frank.patel@radiologycenter.com',
  },
];

// Mock file data
const mockFiles = [
  {
    id: 'file-1',
    name: 'Blood Test Report.pdf',
    size: '1.2 MB',
    uploadedAt: '2024-06-01',
  },
  {
    id: 'file-2',
    name: 'MRI Scan.jpg',
    size: '3.8 MB',
    uploadedAt: '2024-05-20',
  },
  {
    id: 'file-3',
    name: 'Prescription.docx',
    size: '0.3 MB',
    uploadedAt: '2024-04-15',
  },
];

// Utility: Generate consent token with BigInt-safe serialization
function bigIntReplacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

function generateConsentToken({ patientPrincipal, doctorHealthId, files, consentType, expiry, createdAt }) {
  const data = {
    patientPrincipal,
    doctorHealthId,
    files,
    consentType,
    expiry,
    createdAt,
  };
  const json = JSON.stringify(data, bigIntReplacer);
  return SHA256(json).toString();
}

// Utility: Backend call for sharing records
async function sendShareRequest({ doctorHealthId, requestType, requestDetails, consentToken, sharedFiles }) {
  const actor = await getBackendActor();
  return actor.create_appointment_request(
    doctorHealthId,
    requestType,
    requestDetails,
    requestType === 'consent' ? [consentToken] : [],
    requestType === 'consent' ? [sharedFiles] : []
  );
}

const ShareRecords = () => {
  const [showDoctors, setShowDoctors] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDoctor, setModalDoctor] = useState(null);
  const [requestType, setRequestType] = useState('appointment');
  const [requestDetails, setRequestDetails] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // [{fileId, permission, expiresAt}]
  const [fileSettings, setFileSettings] = useState({}); // {fileId: {permission, expiresAt}}

  const { records, loading, error } = usePatientRecords();

  // Unique specialties for filter dropdown
  const specialties = Array.from(new Set(mockDoctors.map(d => d.specialty)));

  // Filtered doctor list
  const filteredDoctors = mockDoctors.filter(d =>
    (!searchName || d.name.toLowerCase().includes(searchName.toLowerCase())) &&
    (!searchSpecialty || d.specialty === searchSpecialty)
  );

  const openRequestModal = (doctor) => {
    setModalDoctor(doctor);
    setRequestType('appointment');
    setRequestDetails('');
    setSubmitStatus('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalDoctor(null);
    setRequestType('appointment');
    setRequestDetails('');
    setSubmitStatus('');
    setSubmitting(false);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!modalDoctor) return;
    setSubmitting(true);
    setSubmitStatus('');
    try {
      let consentToken = null;
      let sharedFiles = null;
      let patientPrincipal = '';
      // Use AuthClient for principal
      const authClient = await AuthClient.create();
      patientPrincipal = authClient.getIdentity().getPrincipal().toText();
      if (requestType === 'consent') {
        // Validation: At least one file selected
        if (selectedFiles.length === 0) {
          setSubmitStatus('Please select at least one file to share.');
          setSubmitting(false);
          return;
        }
        // Validation: All selected files have permission and valid expiresAt
        for (const fileId of selectedFiles) {
          const settings = fileSettings[fileId];
          if (!settings || !settings.permission) {
            setSubmitStatus('Please set permission for all selected files.');
            setSubmitting(false);
            return;
          }
          if (settings.expiresAt && isNaN(new Date(settings.expiresAt).getTime())) {
            setSubmitStatus('Please provide a valid expiration date for all selected files.');
            setSubmitting(false);
            return;
          }
        }
        // Gather data for token
        const doctorHealthId = modalDoctor.healthId;
        const files = selectedFiles.map(fileId => ({
          fileId,
          ...fileSettings[fileId],
        }));
        const expiry = files.reduce((max, f) => f.expiresAt && f.expiresAt > max ? f.expiresAt : max, '');
        const createdAt = new Date().toISOString();
        consentToken = generateConsentToken({
          patientPrincipal,
          doctorHealthId,
          files,
          consentType: 'consent',
          expiry,
          createdAt,
        });
        // Build sharedFiles for backend (file_id: nat64, permission: text, duration: nat64)
        sharedFiles = files.map(f => ({
          file_id: Number(f.fileId),
          permission: f.permission,
          duration: f.expiresAt ? Number(new Date(f.expiresAt).getTime()) : 0,
        }));
        // Debug logs
        console.log('sharedFiles to backend:', sharedFiles);
        console.log('consentToken to backend:', consentToken);
        if (sharedFiles && sharedFiles[0]) {
          console.log('typeof file_id:', typeof sharedFiles[0].file_id);
          console.log('typeof duration:', typeof sharedFiles[0].duration);
        }
      }
      // Modularized backend call
      const result = await sendShareRequest({
        doctorHealthId: modalDoctor.healthId,
        requestType,
        requestDetails,
        consentToken,
        sharedFiles,
      });
      if (result && result.err) {
        setSubmitStatus('Error: ' + result.err);
      } else {
        setSubmitStatus('Request sent successfully!');
        // Optional: Auto-close modal after success
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      setSubmitStatus('Error: ' + (err.message || 'Could not send request.'));
      console.error('Share request error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (fileId, checked) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
      setFileSettings(prev => ({
        ...prev,
        [fileId]: {
          permission: 'view',
          expiresAt: '',
        },
      }));
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      setFileSettings(prev => {
        const copy = { ...prev };
        delete copy[fileId];
        return copy;
      });
    }
  };

  const handlePermissionChange = (fileId, value) => {
    setFileSettings(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        permission: value,
      },
    }));
  };

  const handleExpiresAtChange = (fileId, value) => {
    setFileSettings(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        expiresAt: value,
      },
    }));
  };

  const handleSendFiles = () => {
    // Collect selected files with their settings
    const filesToSend = selectedFiles.map(fileId => ({
      fileId,
      ...fileSettings[fileId],
    }));
    // For now, just log them
    console.log('Sharing files:', filesToSend);
    // TODO: Integrate with backend
  };

  return (
    <div className="share-records-section">
      <h2 style={{ color: '#7c3aed', marginBottom: '1.2rem', textAlign: 'center' }}>Share Records with a Provider</h2>
      <p style={{ textAlign: 'center', color: '#5b21b6', marginBottom: '2rem' }}>
        Search for a healthcare provider and send an appointment or consent request to securely share your records.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          className="provider-search-btn"
          style={{ fontSize: '1.1rem', padding: '0.8rem 2.2rem' }}
          onClick={() => setShowDoctors(v => !v)}
        >
          {showDoctors ? 'Hide Doctor List' : 'Find Doctor'}
        </button>
      </div>
      {showDoctors && (
        <div className="provider-search-card">
          <div className="provider-search-fields" style={{ marginBottom: '1.2rem' }}>
            <input
              type="text"
              placeholder="Search by name"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className="provider-search-input"
              style={{ maxWidth: 220 }}
            />
            <select
              value={searchSpecialty}
              onChange={e => setSearchSpecialty(e.target.value)}
              className="provider-search-input"
              style={{ maxWidth: 220 }}
            >
              <option value="">All Specialties</option>
              {specialties.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="provider-search-results-wrapper">
            <table className="provider-search-results">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialty</th>
                  <th>Health ID</th>
                  <th>Contact</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#a1a1aa' }}>No doctors found.</td></tr>
                ) : filteredDoctors.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.name}</td>
                    <td>{d.specialty}</td>
                    <td>{d.healthId}</td>
                    <td>{d.contact}</td>
                    <td>
                      <button
                        className="provider-search-btn"
                        style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}
                        onClick={() => openRequestModal(d)}
                      >
                        Request Appointment/Consent
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal for request */}
      {modalOpen && modalDoctor && (
        <div className="provider-search-modal-overlay">
          <div className="provider-search-modal">
            <button className="provider-search-modal-close" onClick={closeModal}>&times;</button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#18181b', margin: 0 }}>
                Request Appointment/Consent
              </h3>
            </div>
            <div style={{ marginBottom: '0.7rem', color: '#5b21b6', fontWeight: 500 }}>
              Provider: {modalDoctor.name}
            </div>
            <form onSubmit={handleRequestSubmit} className="provider-search-modal-form">
              <label>
                Request Type:
                <select value={requestType} onChange={e => setRequestType(e.target.value)}>
                  <option value="appointment">Appointment</option>
                  <option value="consent">Consent</option>
                </select>
              </label>
              <label>
                Details:
                <textarea
                  value={requestDetails}
                  onChange={e => setRequestDetails(e.target.value)}
                  placeholder={requestType === 'appointment' ? 'Reason, preferred date/time, etc.' : 'Consent details (e.g., which records to share)'}
                  required
                  rows={3}
                />
              </label>
              {requestType === 'consent' && (
                <>
                  <div className="modal-file-table-title fade-slide-in">Select Files to Share</div>
                  <div className="share-files-table-wrapper fade-slide-in" style={{ marginTop: '1.2rem' }}>
                    <table className="share-files-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>File Name</th>
                          <th>Category</th>
                          <th>Type</th>
                          <th>Uploaded</th>
                          <th>Permission</th>
                          <th>Access Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.length === 0 && !loading ? (
                          <tr><td colSpan={7} style={{ textAlign: 'center', color: '#a1a1aa' }}>No records found.</td></tr>
                        ) : records.map(file => {
                          const isSelected = selectedFiles.includes(file.id);
                          return (
                            <tr key={file.id} className={isSelected ? 'selected' : ''}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => handleFileSelect(file.id, e.target.checked)}
                                />
                              </td>
                              <td>{file.name}</td>
                              <td>{file.category}</td>
                              <td>{file.file_type}</td>
                              <td>{new Date(Number(file.uploaded_at)).toLocaleDateString()}</td>
                              <td>
                                {isSelected ? (
                                  <select
                                    value={fileSettings[file.id]?.permission || 'view'}
                                    onChange={e => handlePermissionChange(file.id, e.target.value)}
                                  >
                                    <option value="view">View only</option>
                                    <option value="edit">Edit</option>
                                  </select>
                                ) : '--'}
                              </td>
                              <td>
                                {isSelected ? (
                                  <input
                                    type="datetime-local"
                                    value={fileSettings[file.id]?.expiresAt || ''}
                                    onChange={e => handleExpiresAtChange(file.id, e.target.value)}
                                  />
                                ) : '--'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <button type="submit" className="provider-search-btn" disabled={submitting || (requestType === 'consent' && selectedFiles.length === 0)}>
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
              {submitStatus && <div className="provider-search-modal-status">{submitStatus}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareRecords; 