import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './PatientDashboard.css';
import Notifications from '../dashboard/Notifications';
import Footer from '../common/Footer';
import { getPatientProfile, registerPatient } from '../../canisterApi';

const PatientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem('principal');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setRegError('');
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const result = await getPatientProfile(user);
        if (result && result[0]) {
          setProfile(result[0]);
          setShowRegistration(false);
        } else {
          setShowRegistration(true);
        }
      } catch (e) {
        setShowRegistration(true);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      const result = await registerPatient(regName, Number(regAge), regGender);
      if (result && result.ok) {
        setProfile(result.ok);
        setShowRegistration(false);
      } else if (result && result.err) {
        setRegError(result.err);
        console.error('Registration error:', result.err); // Log backend error
      } else {
        setRegError('Registration failed.');
        console.error('Registration failed:', result);
      }
    } catch (e) {
      setRegError('Registration failed.');
      console.error('Registration exception:', e);
    }
    setRegLoading(false);
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  if (showRegistration) {
    return (
      <div className="patient-dashboard-layout">
        <header className="patient-dashboard-header enhanced-header">
          <div className="header-left">
            <span className="dashboard-logo">🩺</span>
            <div>
              <h2>Patient Dashboard</h2>
              <div className="dashboard-subtitle">Register as a patient to continue</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </header>
        <main className="patient-dashboard-content enhanced-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <form className="patient-register-card" onSubmit={handleRegister} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #4b3ca71a', padding: '2.5rem 2.5rem 2rem 2.5rem', minWidth: 340 }}>
            <h3 style={{ marginBottom: 18 }}>Patient Registration</h3>
            <label htmlFor="patient-name">Your Name</label>
            <input id="patient-name" type="text" value={regName} onChange={e => setRegName(e.target.value)} required style={{ width: '100%', margin: '0.5rem 0 1.2rem 0', padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }} />
            <label htmlFor="patient-age">Age</label>
            <input id="patient-age" type="number" min="0" value={regAge} onChange={e => setRegAge(e.target.value)} required style={{ width: '100%', margin: '0.5rem 0 1.2rem 0', padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }} />
            <label htmlFor="patient-gender">Gender</label>
            <select id="patient-gender" value={regGender} onChange={e => setRegGender(e.target.value)} required style={{ width: '100%', margin: '0.5rem 0 1.2rem 0', padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }}>
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit" className="logout-btn" style={{ width: '100%', marginBottom: 10 }} disabled={regLoading}>{regLoading ? 'Registering...' : 'Register'}</button>
            {regError && <div style={{ color: 'red', marginTop: 8 }}>{regError}</div>}
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="patient-dashboard-layout">
      <header className="patient-dashboard-header enhanced-header">
        <div className="header-left">
          <span className="dashboard-logo">🩺</span>
          <div>
            <h2>Patient Dashboard</h2>
            <div className="dashboard-subtitle">Your secure health records at a glance</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {profile && <div className="dashboard-user">Health ID: <span className="user-principal">{profile.health_id}</span></div>}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <div className="patient-dashboard-body">
        <aside className="patient-dashboard-sidebar enhanced-sidebar">
          <nav>
            <ul>
              <li className={location.pathname.endsWith('/records') ? 'active' : ''}>
                <Link to="/dashboard/patient/records"><span className="sidebar-icon">📄</span> View Records</Link>
              </li>
              <li className={location.pathname.endsWith('/upload') ? 'active' : ''}>
                <Link to="/dashboard/patient/upload"><span className="sidebar-icon">⬆️</span> Upload Record</Link>
              </li>
              <li className={location.pathname.endsWith('/share') ? 'active' : ''}>
                <Link to="/dashboard/patient/share"><span className="sidebar-icon">🔗</span> Share Records</Link>
              </li>
              <li className={location.pathname.endsWith('/notifications') ? 'active' : ''}>
                <Link to="/dashboard/patient/notifications"><span className="sidebar-icon">🔔</span> Notifications</Link>
              </li>
              <li className={location.pathname.endsWith('/access-logs') ? 'active' : ''}>
                <Link to="/dashboard/patient/access-logs"><span className="sidebar-icon">🕒</span> Access Logs</Link>
              </li>
              <li className={location.pathname.endsWith('/consent-history') ? 'active' : ''}>
                <Link to="/dashboard/patient/consent-history"><span className="sidebar-icon">📜</span> Consent History</Link>
              </li>
            </ul>
          </nav>
        </aside>
        <main className="patient-dashboard-content enhanced-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PatientDashboard; 