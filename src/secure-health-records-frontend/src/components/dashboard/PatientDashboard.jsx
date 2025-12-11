import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthClient } from '@dfinity/auth-client';
import { getPatientProfile } from '../../canisterApi';
import DashboardLayout from '../layout/DashboardLayout';
import PatientRegistration from '../auth/PatientRegistration';
import PatientOverview from './patient/PatientOverview';
import PatientShare from './patient/PatientShare';
import HealthRecordList from '../healthRecords/HealthRecordList';
import HealthRecordUpload from '../healthRecords/HealthRecordUpload';
import Notifications from './Notifications';
import AccessLogsRoute from './AccessLogsRoute';
import ConsentHistoryRoute from './ConsentHistoryTable';
import BookAppointment from './patient/BookAppointment';
import MyAppointments from './patient/MyAppointments';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    async function initAuth() {
      const authClient = await AuthClient.create();
      if (!authClient.isAuthenticated()) {
        navigate('/login?role=patient');
        return;
      }
      const p = authClient.getIdentity().getPrincipal().toText();
      setPrincipal(p);

      try {
        const result = await getPatientProfile(p);
        if (result && result.length > 0) {
          setProfile(result[0]);
        } else if (result && result.ok) {
          setProfile(result.ok);
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

  // If authenticated but no profile, show registration
  if (!profile) {
    return <PatientRegistration onSuccess={handleRegistrationSuccess} />;
  }

  return (
    <DashboardLayout role="patient" user={profile} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<PatientOverview principal={principal} />} />
        <Route path="records" element={<HealthRecordList principal={principal} />} />
        <Route path="upload" element={<HealthRecordUpload />} />
        <Route path="share" element={<PatientShare principal={principal} />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="access-logs" element={<AccessLogsRoute />} />
        <Route path="consent-history" element={<ConsentHistoryRoute />} />
      </Routes>
    </DashboardLayout>
  );
};

export default PatientDashboard;
