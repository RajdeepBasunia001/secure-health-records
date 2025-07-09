import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import './RoleSelection.css';

const roles = [
  {
    key: 'patient',
    title: 'Patient',
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="16" r="10" fill="#2563eb"/><rect x="8" y="32" width="32" height="12" rx="6" fill="#60a5fa"/></svg>
    ),
    description: 'Access and manage your personal health records securely.'
  },
  {
    key: 'doctor',
    title: 'Doctor',
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect x="14" y="8" width="20" height="32" rx="6" fill="#2563eb"/><rect x="20" y="20" width="8" height="16" rx="4" fill="#fff"/></svg>
    ),
    description: 'View and update patient records with consent.'
  },
  {
    key: 'admin',
    title: 'Admin',
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect x="10" y="10" width="28" height="28" rx="6" fill="#2563eb"/><path d="M24 18v12M18 24h12" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
    ),
    description: 'Manage platform users and oversee system security.'
  }
];

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (role) => {
    navigate(`/login?role=${role}`);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: 'https://identity.ic0.app/#authorize',
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          console.log('Internet Identity Principal:', principal);
          setLoading(false);
          // Next: store principal and proceed
        },
        onError: (err) => {
          console.error('Login error:', err);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('AuthClient error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="role-selection-page">
      <h1 className="role-selection-title">Select Your Role</h1>
      <div className="role-cards-container">
        {roles.map((role) => (
          <div
            key={role.key}
            className="role-card"
            tabIndex={0}
            role="button"
            aria-label={`Select ${role.title}`}
            onClick={() => handleSelect(role.key)}
            onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && handleSelect(role.key)}
          >
            <div className="role-icon">{role.icon}</div>
            <div className="role-title">{role.title}</div>
            <div className="role-desc">{role.description}</div>
          </div>
        ))}
      </div>
      {/* The login button below is now redundant, but can be kept for direct login if needed */}
      {/* <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button className="cta-btn" onClick={handleLogin} disabled={loading} style={{ minWidth: 220, fontSize: '1.1rem' }}>
          {loading ? 'Signing in...' : 'Sign in with Internet Identity'}
        </button>
      </div> */}
    </div>
  );
};

export default RoleSelection; 