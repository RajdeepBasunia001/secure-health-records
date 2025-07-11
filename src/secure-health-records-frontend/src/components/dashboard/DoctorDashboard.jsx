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

const TABS = [
  { key: 'profile', label: 'Profile', icon: '👤', path: '/dashboard/doctor/profile' },
  { key: 'requests', label: 'Patient Requests', icon: '📥', path: '/dashboard/doctor/requests' },
  { key: 'lookup', label: 'Patient Lookup', icon: '🔍', path: '/dashboard/doctor/lookup' },
  { key: 'upload-notes', label: 'Upload Notes/Prescriptions', icon: '📝', path: '/dashboard/doctor/upload-notes' },
];

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
        // Accept both array and {ok: array} shapes, and extract first element if array
        if (Array.isArray(prof) && prof[0]) profileObj = prof[0];
        else if (prof && prof.ok && Array.isArray(prof.ok) && prof.ok[0]) profileObj = prof.ok[0];
        else if (prof && prof.ok) profileObj = prof.ok;
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
      const result = await registerDoctor(regName, regEmail, regSpeciality, Number(regContact));
      console.log('registerDoctor result (raw):', result);
      if (result && typeof result === 'object' && 'ok' in result) {
        alert(result.ok);
        // Fetch the profile after successful registration
        console.log('Fetching doctor profile for principal:', principal);
        const prof = await getDoctorProfile(principal);
        console.log('Fetched doctor profile:', prof);
        let profileObj = prof;
        if (Array.isArray(prof) && prof[0]) profileObj = prof[0];
        else if (prof && prof.ok && Array.isArray(prof.ok) && prof.ok[0]) profileObj = prof.ok[0];
        else if (prof && prof.ok) profileObj = prof.ok;
        setProfile(normalizeDoctorProfile(profileObj));
        navigate('/dashboard/doctor/profile');
      } else if (result === 'ok' || result === "Doctor registered successfully") {
        alert('Doctor registered successfully');
        // Fetch the profile after successful registration
        console.log('Fetching doctor profile for principal:', principal);
        const prof = await getDoctorProfile(principal);
        console.log('Fetched doctor profile:', prof);
        let profileObj = prof;
        if (Array.isArray(prof) && prof[0]) profileObj = prof[0];
        else if (prof && prof.ok && Array.isArray(prof.ok) && prof.ok[0]) profileObj = prof.ok[0];
        else if (prof && prof.ok) profileObj = prof.ok;
        setProfile(normalizeDoctorProfile(profileObj));
        navigate('/dashboard/doctor/profile');
      } else if (result && result.err) {
        setRegError(result.err);
      } else {
        setRegError('Registration failed.');
      }
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

  // Main dashboard with sidebar links and routed content
  return (
    <div className="doctor-dashboard-layout">
      <header className="doctor-dashboard-header enhanced-header">
        <div className="header-left">
          <span className="dashboard-logo">🩺</span>
          <div>
            <h2>Doctor Dashboard</h2>
            <div className="dashboard-subtitle">Welcome, Dr. {profile?.name}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>
      <div className="doctor-dashboard-body">
        <aside className="doctor-dashboard-sidebar enhanced-sidebar">
          <nav>
            <ul>
              {TABS.map(tab => (
                <li key={tab.key} className={location.pathname === tab.path ? 'active' : ''}>
                  <Link
                    to={tab.path}
                    style={{
                      color: location.pathname === tab.path ? '#4b3ca7' : '#3a3576',
                      fontWeight: location.pathname === tab.path ? 'bold' : 'normal',
                      fontSize: '1.08rem',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.7rem 1.1rem 0.7rem 0.7rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.7rem',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="sidebar-icon">{tab.icon}</span> {tab.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="doctor-dashboard-content enhanced-content">
          {location.pathname === '/dashboard/doctor/profile' && profile && (
            <div style={{maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #4b3ca71a', padding: '2rem 2.5rem'}}>
              <h3 style={{marginBottom: 18, color: '#4b3ca7'}}>Your Profile</h3>
              <ul style={{fontSize: '1.08rem', color: '#333', listStyle: 'none', padding: 0}}>
                <li><b>Name:</b> {profile.name}</li>
                <li><b>Email:</b> {profile.email}</li>
                <li><b>Speciality:</b> {profile.speciality}</li>
                <li><b>Contact:</b> {profile.contact}</li>
                <li><b>Health ID:</b> <span style={{fontFamily: 'monospace', fontSize: '0.93rem'}}>{profile.health_id}</span></li>
              </ul>
            </div>
          )}
          {location.pathname !== '/dashboard/doctor/profile' && <Outlet />}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorDashboard; 