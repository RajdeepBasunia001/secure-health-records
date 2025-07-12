import React, { useEffect, useState } from 'react';
import './ConsentRequests.css';
import { getAppointmentsForProvider, getConsentRequestsForProvider } from '../../canisterApi';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { useNavigate } from 'react-router-dom';
import { usePatientRecords } from '../healthRecords/usePatientRecords';
import { getBackendActor } from '../../dfinity';

const ConsentRequests = () => {
  const [appointments, setAppointments] = useState([]);
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [previewModal, setPreviewModal] = useState({ open: false, url: '', type: '', name: '' });
  const navigate = useNavigate();

  const { records: allRecords, loading: recordsLoading } = usePatientRecords();

  useEffect(() => {
    if (notRegistered) {
      // Redirect to doctor registration after 2 seconds
      const timer = setTimeout(() => {
        navigate('/dashboard/doctor/profile');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notRegistered, navigate]);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      setNotRegistered(false);
      try {
        const authClient = await AuthClient.create();
        const principal = authClient.getIdentity().getPrincipal();
        const actor = await import('../../dfinity').then(m => m.getBackendActor());
        const profile = await actor.get_doctor_profile(principal);
        console.log('Doctor profile:', profile);
        let health_id = '';
        if (profile && profile.health_id) {
          health_id = profile.health_id;
        } else if (profile && profile.ok && profile.ok.health_id) {
          health_id = profile.ok.health_id;
        } else if (Array.isArray(profile) && profile[0] && profile[0].health_id) {
          health_id = profile[0].health_id;
        } else if (profile && typeof profile === 'object') {
          // Try to find health_id anywhere in the object
          for (const key in profile) {
            if (profile[key] && profile[key].health_id) {
              health_id = profile[key].health_id;
              break;
            }
          }
        }
        console.log('Extracted health_id:', health_id);
        if (!health_id) throw new Error('Could not determine doctor health ID.');
        const [appts, cons] = await Promise.all([
          getAppointmentsForProvider(health_id),
          getConsentRequestsForProvider(health_id)
        ]);
        setAppointments(appts);
        setConsents(cons);
      } catch (err) {
        console.error('Backend fetch error:', err);
        setError('Failed to fetch patient requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Approve/Deny handlers
  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      const actor = await import('../../dfinity').then(m => m.getBackendActor());
      const result = await actor.respond_appointment_request(id, true);
      // Optionally, refresh requests
      setConsents(prev => prev.map(req => req.id === id ? { ...req, status: 'approved' } : req));
    } catch (e) {
      alert('Failed to approve request.');
    }
    setActionLoading(null);
  };
  const handleDeny = async (id) => {
    setActionLoading(id + '-deny');
    try {
      const actor = await import('../../dfinity').then(m => m.getBackendActor());
      const result = await actor.respond_appointment_request(id, false);
      setConsents(prev => prev.map(req => req.id === id ? { ...req, status: 'denied' } : req));
    } catch (e) {
      alert('Failed to deny request.');
    }
    setActionLoading(null);
  };

  const handleDownloadRecord = async (fileId, fileName, fileType) => {
    setDownloadingId(fileId);
    try {
      const actor = await getBackendActor();
      const dataOpt = await actor.get_record_data(fileId);
      if (dataOpt && dataOpt.length > 0) {
        const blob = new Blob([new Uint8Array(dataOpt[0])], { type: fileType || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `record-${fileId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('No data found for this record.');
      }
    } catch (e) {
      alert('Failed to download record.');
    }
    setDownloadingId(null);
  };

  const handlePreviewRecord = async (fileId, fileName, fileType) => {
    setDownloadingId(fileId);
    try {
      const actor = await getBackendActor();
      const dataOpt = await actor.get_record_data(fileId);
      if (dataOpt && dataOpt.length > 0) {
        const blob = new Blob([new Uint8Array(dataOpt[0])], { type: fileType || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        let type = 'other';
        if (fileType && fileType.startsWith('image/')) type = 'image';
        else if (fileType === 'application/pdf') type = 'pdf';
        setPreviewModal({ open: true, url, type, name: fileName || `record-${fileId}` });
      } else {
        alert('No data found for this record.');
      }
    } catch (e) {
      alert('Failed to preview record.');
    }
    setDownloadingId(null);
  };

  if (loading) return <div className="modern-loading"><span className="modern-spinner"></span> Loading patient requests...</div>;
  if (notRegistered) return <div className="upload-error">No doctor profile found. Redirecting to registration...</div>;
  if (error) return <div className="upload-error">{error}</div>;

  return (
    <div className="consent-requests modern-requests-page">
      <h2 className="modern-header">Patient Requests</h2>
      <div className="modern-section">
        <h3 className="modern-subheader">Appointments</h3>
        {appointments.length === 0 ? (
          <div className="modern-empty">No appointment requests.</div>
        ) : (
          <ul className="modern-list">
            {appointments.map((req, idx) => (
              <li key={req.id} className={`consent-request-item modern-card animate-fade-in`} style={{animationDelay: `${idx * 80}ms`}}>
                <div className="modern-row"><span className="modern-label">Patient:</span> <span className="modern-value">{typeof req.patient === 'object' && req.patient.toText ? req.patient.toText() : (typeof req.patient === 'string' ? req.patient : JSON.stringify(req.patient))}</span></div>
                <div className="modern-row"><span className="modern-label">Details:</span> <span className="modern-value">{req.details}</span></div>
                <div className={`modern-row modern-status status-${req.status?.toLowerCase()}`}>Status: <span>{req.status}</span></div>
                <div className="modern-row" style={{marginTop: '0.7rem', gap: '1rem'}}>
                  <button
                    className="modern-btn"
                    disabled={actionLoading === req.id + '-approve' || req.status === 'approved'}
                    onClick={() => handleApprove(req.id)}
                  >
                    {actionLoading === req.id + '-approve' ? <span className="modern-spinner" style={{width:18,height:18}}></span> : 'Approve'}
                  </button>
                  <button
                    className="modern-btn modern-btn-outline"
                    disabled={actionLoading === req.id + '-deny' || req.status === 'denied'}
                    onClick={() => handleDeny(req.id)}
                  >
                    {actionLoading === req.id + '-deny' ? <span className="modern-spinner" style={{width:18,height:18}}></span> : 'Deny'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="modern-section">
        <h3 className="modern-subheader">Consent Requests</h3>
        {consents.length === 0 ? (
          <div className="modern-empty">No consent requests.</div>
        ) : (
          <ul className="modern-list">
            {consents.map((req, idx) => (
              <li key={req.id} className={`consent-request-item modern-card animate-fade-in`} style={{animationDelay: `${idx * 80}ms`}}>
                <div className="modern-row"><span className="modern-label">Patient:</span> <span className="modern-value">{typeof req.patient === 'object' && req.patient.toText ? req.patient.toText() : (typeof req.patient === 'string' ? req.patient : JSON.stringify(req.patient))}</span></div>
                <div className="modern-row"><span className="modern-label">Details:</span> <span className="modern-value">{req.details}</span></div>
                <div className={`modern-row modern-status status-${req.status?.toLowerCase()}`}>Status: <span>{req.status}</span></div>
                {Array.isArray(req.shared_files) && req.shared_files.length > 0 && (
                  <div className="modern-row" style={{marginTop: '0.5rem', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <span className="modern-label" style={{marginBottom: '0.2rem'}}>Attached Records:</span>
                    <ul className="modern-list" style={{gap: '0.3rem', marginLeft: '1.2rem', marginTop: 0}}>
                      {req.shared_files.map((file, i) => {
                        const rec = allRecords.find(r => Number(r.id) === Number(file.file_id));
                        return (
                          <li key={file.file_id + '-' + i} style={{background: '#f3f4f6', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.97em', color: '#333', display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
                            <span style={{fontWeight: 500}}>{rec ? rec.name : (file.file_id ? `Record #${file.file_id}` : 'Unknown Record')}</span>
                            {rec && <span style={{color: '#7c3aed', marginLeft: 4}}>[{rec.category}]</span>}
                            <span style={{marginLeft: 8, color: '#5b21b6'}}>Permission: {file.permission}</span>
                            {file.duration ? <span style={{marginLeft: 8, color: '#a1a1aa'}}>Duration: {new Date(Number(file.duration)).toLocaleString()}</span> : null}
                            {file.file_id && (
                              <>
                                {(rec && (rec.file_type?.startsWith('image/') || rec.file_type === 'application/pdf')) && (
                                  <button
                                    className="modern-btn"
                                    style={{marginLeft: 8, padding: '0.2rem 0.8rem', fontSize: '0.95em'}}
                                    disabled={downloadingId === file.file_id}
                                    onClick={() => handlePreviewRecord(Number(file.file_id), rec ? rec.name : undefined, rec ? rec.file_type : undefined)}
                                  >
                                    {downloadingId === file.file_id ? <span className="modern-spinner" style={{width:16,height:16}}></span> : 'Preview'}
                                  </button>
                                )}
                                <button
                                  className="modern-btn modern-btn-outline"
                                  style={{marginLeft: 8, padding: '0.2rem 0.8rem', fontSize: '0.95em'}}
                                  disabled={downloadingId === file.file_id}
                                  onClick={() => handleDownloadRecord(Number(file.file_id), rec ? rec.name : undefined, rec ? rec.file_type : undefined)}
                                >
                                  {downloadingId === file.file_id ? <span className="modern-spinner" style={{width:16,height:16}}></span> : 'Download'}
                                </button>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <div className="modern-row" style={{marginTop: '0.7rem', gap: '1rem'}}>
                  <button
                    className="modern-btn"
                    disabled={actionLoading === req.id + '-approve' || req.status === 'approved'}
                    onClick={() => handleApprove(req.id)}
                  >
                    {actionLoading === req.id + '-approve' ? <span className="modern-spinner" style={{width:18,height:18}}></span> : 'Approve'}
                  </button>
                  <button
                    className="modern-btn modern-btn-outline"
                    disabled={actionLoading === req.id + '-deny' || req.status === 'denied'}
                    onClick={() => handleDeny(req.id)}
                  >
                    {actionLoading === req.id + '-deny' ? <span className="modern-spinner" style={{width:18,height:18}}></span> : 'Deny'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {previewModal.open && (
        <div className="record-modal-overlay" onClick={() => setPreviewModal({ open: false, url: '', type: '', name: '' })}>
          <div className="record-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 32px rgba(124,58,237,0.13)', position: 'relative' }}>
            <button className="record-modal-close" onClick={() => setPreviewModal({ open: false, url: '', type: '', name: '' })} style={{ position: 'absolute', top: 12, right: 18, fontSize: 28, background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer' }}>&times;</button>
            <div style={{ marginBottom: 16, fontWeight: 600, color: '#5b21b6', fontSize: '1.1em' }}>{previewModal.name}</div>
            {previewModal.type === 'image' && (
              <img src={previewModal.url} alt={previewModal.name} style={{ maxWidth: '80vw', maxHeight: '70vh', borderRadius: 10 }} />
            )}
            {previewModal.type === 'pdf' && (
              <iframe src={previewModal.url} title={previewModal.name} style={{ width: '80vw', height: '70vh', border: 'none', borderRadius: 10 }} />
            )}
            {previewModal.type === 'other' && (
              <a href={previewModal.url} download={previewModal.name} target="_blank" rel="noopener noreferrer">Download file</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentRequests; 