import { getBackendActor } from './dfinity';
import { Principal } from '@dfinity/principal';

// Fetch access logs for a record
export async function fetchAccessLogs(recordId) {
  const actor = await getBackendActor();
  return actor.get_access_logs_for_record(recordId);
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
  return actor.revoke_consent(consentId);
}

// Extend consent by ID and new expiration timestamp
export async function extendConsent(consentId, newExpiresAt) {
  const actor = await getBackendActor();
  return actor.extend_consent(consentId, newExpiresAt);
}

// Fetch doctor profile by principal string
export async function getDoctorProfile(principalString) {
  console.log('getDoctorProfile called with principal:', principalString);
  const actor = await getBackendActor();
  const principal = Principal.fromText(principalString);
  return actor.get_doctor_profile(principal);
}

// Register a new doctor
export async function registerDoctor(name, email, speciality, contact) {
  const actor = await getBackendActor();
  console.log('registerDoctor called');
  return actor.register_doctor(name, email, speciality, contact);
}

// Fetch patient profile by principal string
export async function getPatientProfile(principalString) {
  console.log('getPatientProfile called with principal:', principalString);
  const actor = await getBackendActor();
  const principal = Principal.fromText(principalString);
  return actor.get_patient_profile(principal);
}

// Register a new patient
export async function registerPatient(name, age, gender) {
  const actor = await getBackendActor();
  console.log('registerPatient called');
  return actor.register_patient(name, age, gender);
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