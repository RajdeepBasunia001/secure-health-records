import React, { useEffect, useState } from 'react';
import { fetchAccessLogs } from '../../canisterApi';
import styles from './AccessLogsTable.module.css';

export default function AccessLogsTable({ recordId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!recordId) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAccessLogs(recordId)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [recordId]);

  const filteredLogs = logs.filter(
    log =>
      log.accessed_by.includes(filter) ||
      log.access_type.toLowerCase().includes(filter.toLowerCase()) ||
      (log.purpose && log.purpose.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <section className={styles['access-logs-section']}>
      <div className={styles['access-logs-card']}>
        <h2 className={styles['access-logs-header']}>Access Logs</h2>
        <input
          type="text"
          className={styles['access-logs-input']}
          placeholder="Filter by user, type, or purpose"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        {loading ? (
          <div>Loading access logs...</div>
        ) : !recordId ? (
          <div>Please select a record to view access logs.</div>
        ) : !filteredLogs.length ? (
          <div>No access logs found.</div>
        ) : (
          <div className={styles['access-logs-table-wrapper']}>
            <table className={styles['access-logs-table']}>
              <thead>
                <tr>
                  <th>Accessed By</th>
                  <th>At</th>
                  <th>Type</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id}>
                    <td>{log.accessed_by}</td>
                    <td>{new Date(Number(log.accessed_at)).toLocaleString()}</td>
                    <td>{log.access_type}</td>
                    <td>{log.purpose || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
} 