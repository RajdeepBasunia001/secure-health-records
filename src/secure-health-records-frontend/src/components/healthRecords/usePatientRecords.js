import { useState, useEffect, useCallback } from 'react';
import { getBackendActor } from '../../dfinity';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client'; // NEW: import AuthClient

export function usePatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper to get the current principal from AuthClient
  const getCurrentPrincipal = async () => {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    return identity.getPrincipal().toText();
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const principalString = await getCurrentPrincipal(); // Use AuthClient
      console.log('Fetching records for principal:', principalString); // DEBUG
      if (!principalString) throw new Error('User not logged in');
      const principal = Principal.fromText(principalString);
      const actor = await getBackendActor();
      if (!actor) throw new Error('Backend not initialized. Please try again.');
      const backendRecords = await actor.get_records(principal);
      console.log('Records returned from backend:', backendRecords); // DEBUG
      // Map backend records to frontend format (metadata only)
      const processed = backendRecords.map(record => {
        const category = record.category ? Object.keys(record.category)[0] : '';
        let type = 'other';
        if (record.file_type.startsWith('image/')) type = 'image';
        else if (record.file_type === 'application/pdf') type = 'pdf';
        return {
          ...record,
          category,
          type,
        };
      });
      setRecords(processed);
    } catch (err) {
      setError(err.message || 'Could not fetch records from backend.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    // Listen for custom event to refresh records
    const handler = () => fetchRecords();
    window.addEventListener('health-records-updated', handler);
    return () => window.removeEventListener('health-records-updated', handler);
  }, [fetchRecords]);

  // Helper to fetch file data for a record
  const fetchRecordData = async (recordId, fileType) => {
    const actor = await getBackendActor();
    if (!actor) return '';
    const dataOpt = await actor.get_record_data(recordId);
    if (dataOpt && dataOpt.length > 0) {
      const blob = new Blob([new Uint8Array(dataOpt[0])], { type: fileType });
      return URL.createObjectURL(blob);
    }
    return '';
  };

  // Helper to delete a record
  const deleteRecord = async (recordId) => {
    try {
      const actor = await getBackendActor();
      if (!actor) throw new Error('Backend not initialized. Please try again.');
      const result = await actor.delete_record(recordId);
      if ('err' in result) throw new Error(result.err);
      // Trigger refetch
      fetchRecords();
      // Optionally, dispatch a custom event for other listeners
      window.dispatchEvent(new Event('health-records-updated'));
      return true;
    } catch (err) {
      setError(err.message || 'Could not delete record.');
      return false;
    }
  };

  // Helper to rename a record
  const renameRecord = async (recordId, newName) => {
    try {
      const actor = await getBackendActor();
      if (!actor) throw new Error('Backend not initialized. Please try again.');
      const result = await actor.rename_record(recordId, newName);
      if ('err' in result) throw new Error(result.err);
      fetchRecords();
      window.dispatchEvent(new Event('health-records-updated'));
      return true;
    } catch (err) {
      setError(err.message || 'Could not rename record.');
      return false;
    }
  };

  return { records, loading, error, refetch: fetchRecords, fetchRecordData, deleteRecord, renameRecord };
} 