import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import './Login.css';
import { createBackendActor } from '../../dfinity';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const roleLabels = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
};

// Set your local Internet Identity canister ID here:
const LOCAL_II_CANISTER_ID = "ulvla-h7777-77774-qaacq-cai"; // <-- Replace with your actual local II canister ID if different
const identityProvider = `http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943/`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const query = useQuery();
  const role = query.get('role');
  const navigate = useNavigate();

  console.log('Login environment: LOCAL');
  console.log('Identity provider URL:', identityProvider);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider,
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          console.log('Internet Identity Principal:', principal);
          console.log('Selected Role:', role);
          // Store principal and role in localStorage
          localStorage.setItem('principal', principal);
          localStorage.setItem('role', role);
          // Create authenticated backend actor
          await createBackendActor(identity);
          setLoading(false);
          // Redirect to the appropriate dashboard
          if (role === 'patient') {
            navigate('/dashboard/patient/records');
          } else if (role === 'doctor') {
            navigate('/dashboard/doctor');
          } else if (role === 'admin') {
            navigate('/dashboard/admin');
          }
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

  const handleContinue = (e) => {
    e.preventDefault();
    // Handle email login or show a message (to be implemented)
    alert(`Continue with email: ${email}`);
  };

  const handleSignup = () => {
    navigate('/register');
  };

  const handleSignin = () => {
    navigate('/login');
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-icon">{/* Placeholder icon */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="22" stroke="#c084fc" strokeWidth="4" fill="none" />
            <path d="M16 32C24 24 32 32 32 16" stroke="#c084fc" strokeWidth="3" fill="none" />
          </svg>
        </div>
        <h2 className="login-title">Welcome to Secure Health Records</h2>
        <p className="login-subtitle">Create your account and access secure health data.</p>
        <button className="login-ii-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in with Internet Identity'}
        </button>
        <div className="login-separator">or</div>
        <form className="login-form" onSubmit={handleContinue}>
          <input
            type="email"
            className="login-input"
            placeholder="Enter email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="login-continue-btn" type="submit">Continue</button>
        </form>
        <div className="login-terms">
          By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </div>
        <div className="login-signup-link">
          Don't have an account? <span className="login-link" onClick={handleSignup}>Sign up</span>
        </div>
      </div>
    </div>
  );
};

export default Login; 