import { getBackendActor } from './dfinity';
export { getBackendActor };
import { Principal } from '@dfinity/principal';

// Helper to ensure numbers are converted to generic handling (BigInt if large) if needed
// though Candid libs usually handle Number -> BigInt auto-conversion for u64 if safe integer.

// Fetch access logs for a record
export async function fetchAccessLogs(recordId) {
  const actor = await getBackendActor();
  return actor.get_access_logs_for_record(BigInt(recordId));
}

// Fetch consent history for a patient
export async function fetchConsentHistory(patientPrincipal) {
  const actor = await getBackendActor();
  const principalObj = Principal.fromText(patientPrincipal);
  return actor.get_consent_history_for_patient(principalObj);
}

// Revoke consent by ID
export async function revokeConsent(consentId) {
  const actor = await getBackendActor();
  return actor.revoke_consent(BigInt(consentId));
}

// Extend consent by ID and new expiration timestamp
export async function extendConsent(consentId, newExpiresAt) {
  const actor = await getBackendActor();
  return actor.extend_consent(BigInt(consentId), BigInt(newExpiresAt));
}

// Fetch doctor profile by principal string (NOT health ID)
export async function getDoctorProfile(principalString) {
  if (typeof principalString === 'string' && principalString.startsWith('DOC-')) {
    console.warn('[getDoctorProfile] Called with a health ID. Use getDoctorByHealthId instead!');
  }
  const actor = await getBackendActor();
  const principal = Principal.fromText(principalString);
  return actor.get_doctor_profile(principal);
}

// Register a new doctor
export async function registerDoctor(name, email, speciality, contact) {
  const actor = await getBackendActor();
  // Ensure contact is BigInt for u64
  return actor.register_doctor(name, email, speciality, BigInt(contact));
}

// Fetch patient profile by principal string
export async function getPatientProfile(principalString) {
  const actor = await getBackendActor();
  const principal = Principal.fromText(principalString);
  return actor.get_patient_profile(principal);
}

// Register a new patient
export async function registerPatient(name, age, gender, email, contact) {
  const actor = await getBackendActor();
  // age is u8 (number fine), contact is u64 (BigInt preferred)
  return actor.register_patient(name, Number(age), gender, email, BigInt(contact));
}

// Fetch patient profile by health ID
export async function getPatientByHealthId(healthId) {
  const actor = await getBackendActor();
  return actor.get_patient_by_health_id(healthId);
}

// Fetch all registered doctors
export async function fetchAllDoctors() {
  const actor = await getBackendActor();
  return actor.debug_list_doctors();
}

// Fetch doctor profile by health ID
export async function getDoctorByHealthId(healthId) {
  const actor = await getBackendActor();
  return actor.get_doctor_by_health_id(healthId);
}

// Create a consent request (uses new backend method with frontend field order)
export async function createConsentRequest(providerHealthId, details, consentToken, sharedFiles) {
  const actor = await getBackendActor();
  // sharedFiles items should have file_id as generic usually, but safer to Ensure BigInt
  const sanitizedFiles = sharedFiles.map(f => ({
    ...f,
    file_id: BigInt(f.file_id),
    duration: BigInt(f.duration)
  }));
  return actor.create_consent_request(providerHealthId, details, consentToken, sanitizedFiles);
}

// Fetch only appointment requests for a doctor
export async function getAppointmentsForProvider(healthId) {
  const actor = await getBackendActor();
  return actor.get_appointments_for_provider(healthId);
}

// Fetch only consent requests for a doctor
export async function getConsentRequestsForProvider(healthId) {
  const actor = await getBackendActor();
  return actor.get_consent_requests_for_provider(healthId);
}

// --- New Feature APIs ---

export async function getPatientAppointments() {
  const actor = await getBackendActor();
  return actor.get_patient_appointments();
}

export async function addPatientRecord(patientPrincipal, name, fileType, categoryString, data) {
  const actor = await getBackendActor();
  // Map string to variant
  const categoryVariant = { [categoryString]: null };
  return actor.add_patient_record(
    Principal.fromText(patientPrincipal),
    name,
    fileType,
    categoryVariant,
    data
  );
}

export async function requestAppointment(providerHealthId, reason, datetime) {
  const actor = await getBackendActor();
  return actor.create_appointment_request(
    providerHealthId,
    "appointment",
    JSON.stringify({ reason, datetime }),
    [], // consent_token (opt)
    []  // shared_files (opt)
  );
}

export async function respondAppointmentRequest(requestId, statusStr) {
  const actor = await getBackendActor();
  // statusStr: 'approved' or 'rejected'
  const isApproved = statusStr === 'approved';
  // Backend expects bool for approve
  return actor.respond_appointment_request(BigInt(requestId), isApproved);
}