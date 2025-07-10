import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';
import Footer from '../common/Footer';
import { getDoctorProfile, registerDoctor } from '../../canisterApi';
import { AuthClient } from '@dfinity/auth-client';

function normalizeDoctorProfile(profileObj) {
  if (!profileObj) return profileObj;
  // Map all expected fields to snake_case
  return {
    health_id: profileObj.health_id || profileObj.healthId || '',
    name: profileObj.name || '',
    email: profileObj.email || '',
    speciality: profileObj.speciality || profileObj.specialty || '',
    contact: profileObj.contact !== undefined ? profileObj.contact : (profileObj.mobile || ''),
    registered_at: profileObj.registered_at || profileObj.registeredAt || '',
    user_principal: profileObj.user_principal || profileObj.userPrincipal || '',
  };
}

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
  const [regEmail, setRegEmail] = useState('');
  const [regSpeciality, setRegSpeciality] = useState('');
  const [regContact, setRegContact] = useState('');
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
        let profileObj = prof;
        if (prof && prof.ok) profileObj = prof.ok;
        setProfile(normalizeDoctorProfile(profileObj));
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
      await registerDoctor(regName, regEmail, regSpeciality, Number(regContact));
      // Fetch the profile after registration
      const prof = await getDoctorProfile(principal);
      let profileObj = prof;
      if (prof && prof.ok) profileObj = prof.ok;
      setProfile(normalizeDoctorProfile(profileObj));
    } catch (e) {
      let errorMsg = 'Registration failed.';
      if (e && e.message) {
        if (e.message.includes('Email already registered')) {
          errorMsg = 'This email is already registered. Please use a different email.';
        } else {
          errorMsg = e.message;
        }
      } else if (typeof e === 'string') {
        if (e.includes('Email already registered')) {
          errorMsg = 'This email is already registered. Please use a different email.';
        } else {
          errorMsg = e;
        }
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
  if (!loading && (!profile || !profile.health_id || !profile.name)) {
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
            <label htmlFor="doctor-email">Email</label>
            <input id="doctor-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required style={{ width: '100%', margin: '0.5rem 0 1.2rem 0', padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }} />
            <label htmlFor="doctor-speciality">Speciality</label>
            <select id="doctor-speciality" value={regSpeciality} onChange={e => setRegSpeciality(e.target.value)} required style={{ width: '100%', margin: '0.5rem 0 1.2rem 0', padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }}>
              <option value="" disabled>Select Speciality</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Radiology">Radiology</option>
              <option value="Pathology">Pathology</option>
              <option value="Gastroenterology">Gastroenterology</option>
            </select>
            <label htmlFor="doctor-contact">Mobile Number</label>
            <input id="doctor-contact" type="tel" pattern="[0-9]{10,15}" value={regContact} onChange={e => setRegContact(e.target.value)} required style={{ width: '100%', margin: '0.5rem 0 1.2rem 0', padding: '0.6rem', borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem' }} />
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