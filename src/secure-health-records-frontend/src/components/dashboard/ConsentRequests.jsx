import React, { useEffect, useState } from 'react';
import { getBackendActor } from '../../dfinity';
import { AuthClient } from '@dfinity/auth-client';

const ConsentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const actor = await getBackendActor();
        const reqs = await actor.get_consent_requests();
        setRequests(reqs);
      } catch (err) {
        console.error('Backend fetch error:', err);
        setError('Failed to fetch consent requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    setStatus('');
    try {
      const actor = await getBackendActor();
      if (action === 'approve') {
        await actor.approve_consent(requestId);
        setStatus('Consent approved.');
      } else {
        await actor.reject_consent(requestId);
        setStatus('Consent rejected.');
      }
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      setStatus('Action failed: ' + (err.message || err));
    }
  };

  if (loading) return <div>Loading consent requests...</div>;
  if (error) return <div className="upload-error">{error}</div>;

  return (
    <div className="consent-requests">
      <h2>Pending Consent Requests</h2>
      {status && <div className="status-message">{status}</div>}
      {requests.length === 0 ? (
        <div>No pending requests.</div>
      ) : (
        <ul>
          {requests.map(req => (
            <li key={req.id} className="consent-request-item">
              <div>Patient: {req.patient_name || req.patient_principal}</div>
              <div>Record: {req.record_name || req.record_id}</div>
              <button onClick={() => handleAction(req.id, 'approve')}>Approve</button>
              <button onClick={() => handleAction(req.id, 'reject')}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConsentRequests; 