import React, { useEffect, useState } from 'react';
import { fetchConsentHistory, revokeConsent, extendConsent } from '../../canisterApi';
import styles from './ConsentHistoryTable.module.css';

export default function ConsentHistoryTable({ patientPrincipal }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // consentId or null
  const [error, setError] = useState('');
  const [extendPrompt, setExtendPrompt] = useState({ id: null, show: false });
  const [newExpiry, setNewExpiry] = useState('');

  useEffect(() => {
    if (!patientPrincipal) return;
    setLoading(true);
    fetchConsentHistory(patientPrincipal)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [patientPrincipal]);

  const filteredHistory = history.filter(
    entry =>
      entry.grantee.includes(filter) ||
      entry.permissions.toLowerCase().includes(filter.toLowerCase()) ||
      entry.status.toLowerCase().includes(filter.toLowerCase())
  );

  const handleRevoke = async (consentId) => {
    setActionLoading(consentId);
    setError('');
    try {
      const res = await revokeConsent(consentId);
      if (res.err) setError(res.err);
      else await reload();
    } catch (e) {
      setError('Failed to revoke consent.');
    }
    setActionLoading(null);
  };

  const handleExtend = async (consentId) => {
    if (!newExpiry) return setError('Please enter a new expiration date.');
    setActionLoading(consentId);
    setError('');
    try {
      const newExpiresAt = new Date(newExpiry).getTime();
      const res = await extendConsent(consentId, newExpiresAt);
      if (res.err) setError(res.err);
      else {
        setExtendPrompt({ id: null, show: false });
        setNewExpiry('');
        await reload();
      }
    } catch (e) {
      setError('Failed to extend consent.');
    }
    setActionLoading(null);
  };

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchConsentHistory(patientPrincipal);
      setHistory(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles['consent-history-section']}>
      <div className={styles['consent-history-card']}>
        <h2 className={styles['consent-history-header']}>Consent History</h2>
        <input
          type="text"
          className={styles['consent-history-input']}
          placeholder="Filter by grantee, permissions, or status"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {loading ? (
          <div>Loading consent history...</div>
        ) : !filteredHistory.length ? (
          <div>No consent history found.</div>
        ) : (
          <div className={styles['consent-history-table-wrapper']}>
            <table className={styles['consent-history-table']}>
              <thead>
                <tr>
                  <th>Grantee</th>
                  <th>Granted At</th>
                  <th>Revoked At</th>
                  <th>Expires At</th>
                  <th>Permissions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td>{entry.grantee}</td>
                    <td>{new Date(Number(entry.granted_at)).toLocaleString()}</td>
                    <td>{entry.revoked_at ? new Date(Number(entry.revoked_at)).toLocaleString() : '--'}</td>
                    <td>{entry.expires_at ? new Date(Number(entry.expires_at)).toLocaleString() : '--'}</td>
                    <td>{entry.permissions}</td>
                    <td>{entry.status}
                      {entry.status === 'active' && (
                        <>
                          <button
                            className={styles['consent-action-btn']}
                            disabled={actionLoading === entry.consent_id}
                            onClick={() => handleRevoke(entry.consent_id)}
                          >
                            {actionLoading === entry.consent_id ? 'Revoking...' : 'Revoke'}
                          </button>
                          <button
                            className={styles['consent-action-btn']}
                            disabled={actionLoading === entry.consent_id}
                            onClick={() => setExtendPrompt({ id: entry.consent_id, show: true })}
                          >
                            Extend
                          </button>
                          {extendPrompt.show && extendPrompt.id === entry.consent_id && (
                            <div className={styles['consent-extend-prompt']}>
                              <input
                                type="datetime-local"
                                value={newExpiry}
                                onChange={e => setNewExpiry(e.target.value)}
                              />
                              <button
                                className={styles['consent-action-btn']}
                                onClick={() => handleExtend(entry.consent_id)}
                                disabled={actionLoading === entry.consent_id}
                              >
                                {actionLoading === entry.consent_id ? 'Extending...' : 'Confirm'}
                              </button>
                              <button
                                className={styles['consent-action-btn']}
                                onClick={() => { setExtendPrompt({ id: null, show: false }); setNewExpiry(''); }}
                                disabled={actionLoading === entry.consent_id}
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && <div className={styles['consent-history-error']}>{error}</div>}
      </div>
    </section>
  );
} 