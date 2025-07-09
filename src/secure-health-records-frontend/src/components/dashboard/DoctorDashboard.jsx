import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import Footer from '../common/Footer';
import { getDoctorProfile, registerDoctor } from '../../canisterApi';

const DoctorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem('principal');

  // Doctor profile state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regName, setRegName] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setRegError('');
      try {
        if (!user) return setProfile(null);
        const prof = await getDoctorProfile(user);
        // Handle possible wrapping and field name differences
        let profileObj = prof;
        if (prof && prof.ok) profileObj = prof.ok;
        if (profileObj && profileObj.healthId && !profileObj.health_id) {
          profileObj.health_id = profileObj.healthId;
        }
        console.log('Doctor profile:', profileObj);
        setProfile(profileObj);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      const result = await registerDoctor(regName);
      if (result.err) setRegError(result.err);
      else setProfile(result.ok);
    } catch (e) {
      setRegError('Registration failed.');
    }
    setRegLoading(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  // Registration UI
  if (!loading && !profile) {
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
          {profile && (
            <div className="dashboard-user">
              <span style={{ fontWeight: 500 }}>Dr. {profile.name}</span> &nbsp;|&nbsp; <span style={{ color: '#fff', background: '#6e5edb', borderRadius: 6, padding: '0.2rem 0.7rem', fontSize: '0.98rem', marginLeft: 4 }}>ID: {profile.health_id}</span>
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