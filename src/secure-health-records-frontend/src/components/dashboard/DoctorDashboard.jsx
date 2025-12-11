import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { getDoctorProfile } from '../../canisterApi';
import DashboardLayout from '../layout/DashboardLayout';
import DoctorRegistration from '../auth/DoctorRegistration';
import DoctorRequests from './doctor/DoctorRequests';
import DoctorOverview from './doctor/DoctorOverview';
import DoctorPatientLookup from './doctor/DoctorPatientLookup';

function normalizeDoctorProfile(profileObj) {
  if (!profileObj) return profileObj;
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
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    async function initAuth() {
      const authClient = await AuthClient.create();
      if (!authClient.isAuthenticated()) {
        navigate('/login?role=doctor');
        return;
      }
      const p = authClient.getIdentity().getPrincipal().toText();
      setPrincipal(p);

      try {
        const result = await getDoctorProfile(p);
        let profileObj = result;
        if (Array.isArray(result) && result[0]) profileObj = result[0];
        else if (result && result.ok && Array.isArray(result.ok) && result.ok[0]) profileObj = result.ok[0];
        else if (result && result.ok) profileObj = result.ok;

        if (profileObj) {
          setProfile(normalizeDoctorProfile(profileObj));
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Profile fetch error", e);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, [navigate]);

  const handleLogout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    localStorage.clear();
    navigate('/');
  };

  const handleRegistrationSuccess = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-indigo-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <DoctorRegistration onSuccess={handleRegistrationSuccess} />;
  }

  return (
    <DashboardLayout role="doctor" user={profile} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<DoctorOverview profile={profile} />} />
        <Route path="requests" element={<DoctorRequests profile={profile} />} />
        <Route path="lookup" element={<DoctorPatientLookup />} />
        <Route path="profile" element={<div className="card"><h3>Profile</h3><pre>{JSON.stringify(profile, null, 2)}</pre></div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
