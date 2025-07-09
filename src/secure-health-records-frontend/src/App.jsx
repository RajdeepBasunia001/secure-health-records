import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavigationBar from './components/layout/NavigationBar';
import HeroSection from './components/layout/HeroSection';
import RoleSelection from './components/auth/RoleSelection';
import Login from './components/auth/Login';
import PatientDashboard from './components/dashboard/PatientDashboard';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import HealthRecordList from './components/healthRecords/HealthRecordList';
import HealthRecordUpload from './components/healthRecords/HealthRecordUpload';
import Notifications from './components/dashboard/Notifications';
import { AuthClient } from '@dfinity/auth-client';
import ShareRecords from './components/dashboard/ShareRecords'; // NEW: import ShareRecords
import AccessLogsRoute from './components/dashboard/AccessLogsRoute';
import ConsentHistoryTable from './components/dashboard/ConsentHistoryTable';
import ConsentRequests from './components/dashboard/ConsentRequests';
import PatientLookup from './components/dashboard/PatientLookup';

const Placeholder = ({ title }) => (
  <section className="py-24 bg-gray-50 text-center">
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-lg text-gray-600">(Content coming soon)</p>
  </section>
);

function LandingPage() {
  return (
    <>
      <HeroSection />
    </>
  );
}

const PatientRecords = () => (
  <HealthRecordList />
);

const PatientUpload = () => (
  <HealthRecordUpload />
);

// Wrapper for ConsentHistoryTable to provide patientPrincipal
function ConsentHistoryRoute() {
  const [principal, setPrincipal] = React.useState(null);
  React.useEffect(() => {
    AuthClient.create().then(authClient => {
      setPrincipal(authClient.getIdentity().getPrincipal().toText());
    });
  }, []);
  return <ConsentHistoryTable patientPrincipal={principal} />;
}

// Placeholder components for doctor dashboard sections
function DoctorRequests() {
  return <section style={{padding: '2rem'}}><h2>Patient Requests</h2><p>(Content coming soon)</p></section>;
}
function DoctorLookup() {
  return <section style={{padding: '2rem'}}><h2>Patient Lookup</h2><p>(Content coming soon)</p></section>;
}
function DoctorUploadNotes() {
  return <section style={{padding: '2rem'}}><h2>Upload Notes/Prescriptions</h2><p>(Content coming soon)</p></section>;
}

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Debug AuthClient session and principal on every load
  useEffect(() => {
    AuthClient.create().then(authClient => {
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal().toText();
      console.log('Principal on app load:', principal);
      console.log('Is authenticated:', authClient.isAuthenticated());
    });
  }, []);

  return (
    <>
      {!isDashboard && <NavigationBar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/platform" element={<Placeholder title="Platform" />} />
        <Route path="/security" element={<Placeholder title="Security" />} />
        <Route path="/features" element={<Placeholder title="Features" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/patient/*" element={<PatientDashboard />}>
          <Route path="records" element={<PatientRecords />} />
          <Route path="upload" element={<PatientUpload />} />
          <Route path="share" element={<ShareRecords />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="access-logs" element={<AccessLogsRoute />} />
          <Route path="consent-history" element={<ConsentHistoryRoute />} />
        </Route>
        <Route path="/dashboard/doctor/*" element={<DoctorDashboard />}>
          <Route path="requests" element={<ConsentRequests />} />
          <Route path="lookup" element={<PatientLookup />} />
          <Route path="upload-notes" element={<DoctorUploadNotes />} />
        </Route>
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;
