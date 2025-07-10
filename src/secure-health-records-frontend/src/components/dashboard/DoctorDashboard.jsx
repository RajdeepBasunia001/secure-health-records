import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import Footer from '../common/Footer';
import { getDoctorProfile, registerDoctor } from '../../canisterApi';
import { AuthClient } from '@dfinity/auth-client';

const DoctorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // --- AUTH GUARD START ---
  useEffect(() => {
    const principal = localStorage.getItem('principal');
    const role = localStorage.getItem('role');
    if (!principal || role !== 'doctor') {
      navigate('/login?role=doctor', { replace: true });
    }
  }, [navigate]);
  // --- AUTH GUARD END ---
  const [principal, setPrincipal] = useState(null);

  // Doctor profile state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regName, setRegName] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    AuthClient.create().then(authClient => {
      const p = authClient.getIdentity().getPrincipal().toText();
      setPrincipal(p);
    });
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setRegError('');
      try {
        if (!principal) return setProfile(null);
        const prof = await getDoctorProfile(principal);
        // Handle possible wrapping and field name differences
        let profileObj = prof;
        if (prof && prof.ok) profileObj = prof.ok;
        if (profileObj && profileObj.healthId && !profileObj.health_id) {
          profileObj.health_id = profileObj.healthId;
        }
        setProfile(profileObj);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [principal]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      await registerDoctor(regName);
      window.location.reload();
    } catch (e) {
      let errorMsg = 'Registration failed.';
      if (e && e.message) {
        errorMsg = e.message;
      } else if (typeof e === 'string') {
        errorMsg = e;
      }
      setRegError(errorMsg);
      setRegLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  // Registration UI
  if (!loading && (!profile || (Array.isArray(profile) && profile.length === 0))) {
    return (
      <div className="doctor-dashboard-layout">
        <header className="doctor-dashboard-header enhanced-header">
          <div className="header-left">
            <span className="dashboard-logo">🩺</span>
            <div>
              <h2>Doctor Dashboard</h2>
              <div className="dashboard-subtitle">Register as a doctor to continue</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </header>
        <main className="doctor-dashboard-content enhanced-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <form className="doctor-register-card" onSubmit={handleRegister} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #4b3ca71a', padding: '2.5rem 2.5rem 2rem 2.5rem', minWidth: 340 }}>
            <h3 style={{ marginBottom: 18 }}>Doctor Registration</h3>
            <label htmlFor="doctor-name">Your Name</label>
            <input id="doctor-name" type="text" value={regName} onChange={e => setRegName(e.target.value)} required style={{ width: '100%', margin: '0.5rem 0 1.2rem 0', padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }} />
            <button type="submit" className="logout-btn" style={{ width: '100%', marginBottom: 10 }} disabled={regLoading}>{regLoading ? 'Registering...' : 'Register'}</button>
            {regError && <div style={{ color: 'red', marginTop: 8 }}>{regError}</div>}
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="doctor-dashboard-layout">
      <header className="doctor-dashboard-header enhanced-header">
        <div className="header-left">
          <span className="dashboard-logo">🩺</span>
          <div>
            <h2>Doctor Dashboard</h2>
            <div className="dashboard-subtitle">Manage patient requests and records</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {profile && ((Array.isArray(profile) ? profile[0] : profile)) && (
            <div className="dashboard-user">
              <span style={{ fontWeight: 500 }}>
                Dr. {(Array.isArray(profile) ? profile[0]?.name : profile.name)}
              </span>
              &nbsp;|&nbsp;
              <span style={{ color: '#fff', background: '#6e5edb', borderRadius: 6, padding: '0.2rem 0.7rem', fontSize: '0.98rem', marginLeft: 4 }}>
                ID: {(Array.isArray(profile) ? profile[0]?.health_id : profile.health_id)}
              </span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="doctor-dashboard-body">
        <aside className="doctor-dashboard-sidebar enhanced-sidebar">
          <nav>
            <ul>
              <li className={location.pathname.endsWith('/requests') ? 'active' : ''}>
                <Link to="/dashboard/doctor/requests"><span className="sidebar-icon">📥</span> Patient Requests</Link>
              </li>
              <li className={location.pathname.endsWith('/lookup') ? 'active' : ''}>
                <Link to="/dashboard/doctor/lookup"><span className="sidebar-icon">🔍</span> Patient Lookup</Link>
              </li>
              <li className={location.pathname.endsWith('/upload-notes') ? 'active' : ''}>
                <Link to="/dashboard/doctor/upload-notes"><span className="sidebar-icon">📝</span> Upload Notes/Prescriptions</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="doctor-dashboard-content enhanced-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorDashboard; 