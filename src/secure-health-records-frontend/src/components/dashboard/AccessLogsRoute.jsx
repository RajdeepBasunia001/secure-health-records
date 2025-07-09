import React, { useState } from 'react';
import { usePatientRecords } from '../healthRecords/usePatientRecords';
import AccessLogsTable from './AccessLogsTable';

export default function AccessLogsRoute() {
  const { records, loading, error } = usePatientRecords();
  const [selectedId, setSelectedId] = useState('');

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 0' }}>
      <h2 style={{ marginBottom: '1rem' }}>Access Logs</h2>
      {loading ? (
        <div>Loading your records...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : !records.length ? (
        <div>You have no health records yet.</div>
      ) : (
        <>
          <label htmlFor="record-select">Select a record:</label>
          <select
            id="record-select"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            style={{ margin: '0 1rem', padding: '0.3rem 0.6rem' }}
          >
            <option value="">-- Choose a record --</option>
            {records.map(rec => (
              <option key={rec.id} value={rec.id}>
                {rec.name} ({rec.category})
              </option>
            ))}
          </select>
          <AccessLogsTable recordId={selectedId ? Number(selectedId) : undefined} />
        </>
      )}
    </section>
  );
} 