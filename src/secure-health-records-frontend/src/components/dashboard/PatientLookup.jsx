import React, { useState } from 'react';

const mockPatientData = {
  'HID123': { name: 'Alice Smith', healthId: 'HID123', age: 29, gender: 'Female' },
  'HID456': { name: 'Bob Johnson', healthId: 'HID456', age: 42, gender: 'Male' },
};

const PatientLookup = () => {
  const [healthId, setHealthId] = useState('');
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [accessRequested, setAccessRequested] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setPatient(null);
    setAccessRequested(false);
    setSearching(true);
    // Simulate backend search
    setTimeout(() => {
      const found = mockPatientData[healthId.trim()];
      if (found) {
        setPatient(found);
      } else {
        setError('No patient found with that Health ID.');
      }
      setSearching(false);
    }, 700);
  };

  const handleRequestAccess = () => {
    // Simulate sending access request
    setAccessRequested(true);
    console.log(`Access request sent for patient Health ID: ${healthId}`);
  };

  return (
    <div className="patient-lookup">
      <h2>Patient Lookup</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <label htmlFor="health-id-input">Enter Patient Health ID:</label>
        <input
          id="health-id-input"
          type="text"
          value={healthId}
          onChange={e => setHealthId(e.target.value)}
          required
          style={{ margin: '0 12px', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={searching || !healthId.trim()}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {patient && (
        <div className="patient-info-card" style={{ background: '#f9f9ff', padding: 18, borderRadius: 8, marginBottom: 16 }}>
          <div><strong>Name:</strong> {patient.name}</div>
          <div><strong>Health ID:</strong> {patient.healthId}</div>
          <div><strong>Age:</strong> {patient.age}</div>
          <div><strong>Gender:</strong> {patient.gender}</div>
          <button onClick={handleRequestAccess} disabled={accessRequested} style={{ marginTop: 12 }}>
            {accessRequested ? 'Access Requested' : 'Request Access'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientLookup; 