use candid::{CandidType, Principal};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub enum Category {
    General,
    Surgery,
    Immunization,
    Allergies,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct HealthRecord {
    id: u64,
    owner: Principal,
    name: String,
    file_type: String,
    category: Category,
    data: Vec<u8>,
    uploaded_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, PartialEq)]
pub enum ConsentStatus {
    Pending,
    Approved,
    Denied,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct ConsentRequest {
    id: u64,
    patient: Principal,
    requester: Principal,
    requested_at: u64,
    status: ConsentStatus,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub enum NotificationType {
    ConsentRequested,
    ConsentResponded,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Notification {
    id: u64,
    recipient: Principal,
    sender: Principal,
    notif_type: NotificationType,
    message: String,
    created_at: u64,
    read: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct HealthRecordMetadata {
    id: u64,
    owner: Principal,
    name: String,
    file_type: String,
    category: Category,
    uploaded_at: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone, Debug)]
pub struct SharedFilePermission {
    pub file_id: u64,
    pub permission: String, // "view" or "edit"
    pub duration: u64,      // seconds or timestamp
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct AppointmentRequest {
    id: u64,
    patient: Principal,
    provider_health_id: String,
    request_type: String, // "appointment" or "consent"
    details: String,      // Reason, date/time, or consent details
    status: String,       // "pending", "approved", "denied"
    created_at: u64,
    consent_token: Option<String>,
    shared_files: Option<Vec<SharedFilePermission>>,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct AccessLogEntry {
    pub id: u64,
    pub record_id: u64,
    pub accessed_by: Principal,
    pub accessed_at: u64, // timestamp
    pub access_type: String, // "view", "edit", etc.
    pub purpose: Option<String>, // e.g., "diagnosis", "review", etc.
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct ConsentHistoryEntry {
    pub id: u64,
    pub consent_id: u64,
    pub patient: Principal,
    pub grantee: Principal,
    pub granted_at: u64,
    pub revoked_at: Option<u64>,
    pub expires_at: Option<u64>,
    pub permissions: String, // "view", "edit", etc.
    pub status: String, // "active", "revoked", "expired"
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct DoctorProfile {
    pub user_principal: Principal,
    pub health_id: String,
    pub name: String,
    pub registered_at: u64,
}

mod patient;
pub use patient::PatientProfile;

// Storage
thread_local! {
    static RECORDS: std::cell::RefCell<Vec<HealthRecord>> = std::cell::RefCell::new(Vec::new());
    static CONSENT_REQUESTS: std::cell::RefCell<Vec<ConsentRequest>> = std::cell::RefCell::new(Vec::new());
    static NOTIFICATIONS: std::cell::RefCell<Vec<Notification>> = std::cell::RefCell::new(Vec::new());
    static NEXT_RECORD_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
    static NEXT_CONSENT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
    static NEXT_NOTIFICATION_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
    static APPOINTMENT_REQUESTS: std::cell::RefCell<Vec<AppointmentRequest>> = std::cell::RefCell::new(Vec::new());
    static NEXT_APPOINTMENT_REQUEST_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
    static ACCESS_LOGS: std::cell::RefCell<Vec<AccessLogEntry>> = std::cell::RefCell::new(Vec::new());
    static NEXT_ACCESS_LOG_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
    static CONSENT_HISTORY: std::cell::RefCell<Vec<ConsentHistoryEntry>> = std::cell::RefCell::new(Vec::new());
    static NEXT_CONSENT_HISTORY_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
    static DOCTORS: std::cell::RefCell<Vec<DoctorProfile>> = std::cell::RefCell::new(Vec::new());
    static NEXT_DOCTOR_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
}

// --- Health Record Methods ---

#[ic_cdk::update]
fn upload_record(name: String, file_type: String, category: Category, data: Vec<u8>) {
    let caller = ic_cdk::caller();
    let now = time();
    let id = NEXT_RECORD_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let record = HealthRecord {
        id,
        owner: caller,
        name,
        file_type,
        category,
        data,
        uploaded_at: now,
    };
    RECORDS.with(|r| r.borrow_mut().push(record));
}

#[ic_cdk::query]
fn get_records(owner: Principal) -> Vec<HealthRecordMetadata> {
    let caller = ic_cdk::caller();
    let allowed = if caller == owner {
        true
    } else {
        // Check for approved consent
        CONSENT_REQUESTS.with(|reqs| {
            reqs.borrow().iter().any(|req|
                req.patient == owner &&
                req.requester == caller &&
                req.status == ConsentStatus::Approved
            )
        })
    };
    if allowed {
        RECORDS.with(|r| {
            r.borrow().iter().filter(|rec| rec.owner == owner).map(|rec| HealthRecordMetadata {
                id: rec.id,
                owner: rec.owner,
                name: rec.name.clone(),
                file_type: rec.file_type.clone(),
                category: rec.category.clone(),
                uploaded_at: rec.uploaded_at,
            }).collect()
        })
    } else {
        vec![]
    }
}

#[ic_cdk::query]
fn get_record_data(record_id: u64) -> Option<Vec<u8>> {
    RECORDS.with(|r| {
        r.borrow().iter().find(|rec| rec.id == record_id).map(|rec| rec.data.clone())
    })
}

// --- Consent Methods ---

#[ic_cdk::update]
fn request_consent(patient: Principal) {
    let requester = ic_cdk::caller();
    let now = time();
    let id = NEXT_CONSENT_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let req = ConsentRequest {
        id,
        patient,
        requester,
        requested_at: now,
        status: ConsentStatus::Pending,
    };
    CONSENT_REQUESTS.with(|reqs| reqs.borrow_mut().push(req.clone()));
    // Notify patient
    let notif_id = NEXT_NOTIFICATION_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let notif = Notification {
        id: notif_id,
        recipient: patient,
        sender: requester,
        notif_type: NotificationType::ConsentRequested,
        message: format!("{} requested access to your health records.", requester.to_text()),
        created_at: now,
        read: false,
    };
    NOTIFICATIONS.with(|n| n.borrow_mut().push(notif));
}

#[ic_cdk::query]
fn get_consent_requests() -> Vec<ConsentRequest> {
    let caller = ic_cdk::caller();
    CONSENT_REQUESTS.with(|reqs| reqs.borrow().iter().filter(|r| r.patient == caller).cloned().collect())
}

#[ic_cdk::update]
fn respond_consent_request(request_id: u64, approve: bool) {
    let caller = ic_cdk::caller();
    let now = time();
    let mut requester = None;
    CONSENT_REQUESTS.with(|reqs| {
        let mut reqs = reqs.borrow_mut();
        if let Some(req) = reqs.iter_mut().find(|r| r.id == request_id && r.patient == caller) {
            req.status = if approve { ConsentStatus::Approved } else { ConsentStatus::Denied };
            requester = Some(req.requester);
        }
    });
    if let Some(requester) = requester {
        // Notify requester
        let notif_id = NEXT_NOTIFICATION_ID.with(|n| {
            let mut n = n.borrow_mut();
            let id = *n;
            *n += 1;
            id
        });
        let notif = Notification {
            id: notif_id,
            recipient: requester,
            sender: caller,
            notif_type: NotificationType::ConsentResponded,
            message: if approve {
                format!("Your request to access {}'s records was approved.", caller.to_text())
            } else {
                format!("Your request to access {}'s records was denied.", caller.to_text())
            },
            created_at: now,
            read: false,
        };
        NOTIFICATIONS.with(|n| n.borrow_mut().push(notif));
    }
}

// --- Notification Methods ---

#[ic_cdk::query]
fn get_notifications() -> Vec<Notification> {
    let caller = ic_cdk::caller();
    NOTIFICATIONS.with(|n| n.borrow().iter().filter(|notif| notif.recipient == caller).cloned().collect())
}

#[ic_cdk::update]
fn mark_notification_read(notification_id: u64) {
    let caller = ic_cdk::caller();
    NOTIFICATIONS.with(|n| {
        let mut n = n.borrow_mut();
        if let Some(notif) = n.iter_mut().find(|notif| notif.id == notification_id && notif.recipient == caller) {
            notif.read = true;
        }
    });
}

#[ic_cdk::update]
fn delete_record(record_id: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    RECORDS.with(|records| {
        let mut records = records.borrow_mut();
        if let Some(pos) = records.iter().position(|rec| rec.id == record_id && rec.owner == caller) {
            records.remove(pos);
            Ok(())
        } else {
            Err("Record not found or permission denied".to_string())
        }
    })
}

#[ic_cdk::update]
fn rename_record(record_id: u64, new_name: String) -> Result<(), String> {
    let caller = ic_cdk::caller();
    RECORDS.with(|records| {
        let mut records = records.borrow_mut();
        if let Some(rec) = records.iter_mut().find(|rec| rec.id == record_id && rec.owner == caller) {
            rec.name = new_name;
            Ok(())
        } else {
            Err("Record not found or permission denied".to_string())
        }
    })
}

#[ic_cdk::update]
fn create_appointment_request(
    provider_health_id: String,
    request_type: String,
    details: String,
    consent_token: Option<String>,
    shared_files: Option<Vec<SharedFilePermission>>
) -> Result<u64, String> {
    ic_cdk::print(&format!(
        "[DEBUG] create_appointment_request: provider_health_id={}, request_type={}, details={}, consent_token={:?}, shared_files={:?}",
        provider_health_id, request_type, details, consent_token, shared_files
    ));
    let patient = ic_cdk::caller();
    let now = time();
    let id = NEXT_APPOINTMENT_REQUEST_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let req = AppointmentRequest {
        id,
        patient,
        provider_health_id,
        request_type,
        details,
        status: "pending".to_string(),
        created_at: now,
        consent_token,
        shared_files,
    };
    APPOINTMENT_REQUESTS.with(|reqs| reqs.borrow_mut().push(req));
    Ok(id)
}

#[ic_cdk::query]
fn get_appointment_requests_for_provider(provider_health_id: String) -> Vec<AppointmentRequest> {
    APPOINTMENT_REQUESTS.with(|reqs| {
        reqs.borrow().iter().filter(|r| r.provider_health_id == provider_health_id).cloned().collect()
    })
}

#[ic_cdk::update]
fn log_access_event(record_id: u64, accessed_by: Principal, access_type: String, purpose: Option<String>) {
    let now = time();
    let id = NEXT_ACCESS_LOG_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let entry = AccessLogEntry {
        id,
        record_id,
        accessed_by,
        accessed_at: now,
        access_type,
        purpose,
    };
    ACCESS_LOGS.with(|logs| logs.borrow_mut().push(entry));
}

#[ic_cdk::query]
fn get_access_logs_for_record(record_id: u64) -> Vec<AccessLogEntry> {
    ACCESS_LOGS.with(|logs| logs.borrow().iter().filter(|e| e.record_id == record_id).cloned().collect())
}

#[ic_cdk::update]
fn log_consent_history(
    consent_id: u64,
    patient: Principal,
    grantee: Principal,
    granted_at: u64,
    revoked_at: Option<u64>,
    expires_at: Option<u64>,
    permissions: String,
    status: String,
) {
    let id = NEXT_CONSENT_HISTORY_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let entry = ConsentHistoryEntry {
        id,
        consent_id,
        patient,
        grantee,
        granted_at,
        revoked_at,
        expires_at,
        permissions,
        status,
    };
    CONSENT_HISTORY.with(|hist| hist.borrow_mut().push(entry));
}

#[ic_cdk::query]
fn get_consent_history_for_patient(patient: Principal) -> Vec<ConsentHistoryEntry> {
    CONSENT_HISTORY.with(|hist| hist.borrow().iter().filter(|e| e.patient == patient).cloned().collect())
}

#[ic_cdk::update]
fn revoke_consent(consent_id: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let now = time();
    // Update ConsentHistoryEntry
    let mut found = false;
    CONSENT_HISTORY.with(|hist| {
        let mut hist = hist.borrow_mut();
        if let Some(entry) = hist.iter_mut().find(|e| e.consent_id == consent_id && e.patient == caller && e.status == "active") {
            entry.status = "revoked".to_string();
            entry.revoked_at = Some(now);
            found = true;
        }
    });
    if !found {
        return Err("Active consent not found or permission denied".to_string());
    }
    // Update ConsentRequest if needed
    CONSENT_REQUESTS.with(|reqs| {
        let mut reqs = reqs.borrow_mut();
        if let Some(req) = reqs.iter_mut().find(|r| r.id == consent_id && r.patient == caller) {
            req.status = ConsentStatus::Denied;
        }
    });
    Ok(())
}

#[ic_cdk::update]
fn extend_consent(consent_id: u64, new_expires_at: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    let mut found = false;
    CONSENT_HISTORY.with(|hist| {
        let mut hist = hist.borrow_mut();
        if let Some(entry) = hist.iter_mut().find(|e| e.consent_id == consent_id && e.patient == caller && e.status == "active") {
            entry.expires_at = Some(new_expires_at);
            found = true;
        }
    });
    if !found {
        return Err("Active consent not found or permission denied".to_string());
    }
    Ok(())
}

#[ic_cdk::update]
fn register_doctor(name: String) -> Result<DoctorProfile, String> {
    let principal = ic_cdk::caller();
    // Check if already registered
    let already = DOCTORS.with(|docs| docs.borrow().iter().any(|d| d.user_principal == principal));
    if already {
        return Err("Doctor already registered".to_string());
    }
    // Generate unique health ID
    let id = NEXT_DOCTOR_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let health_id = format!("DOC-{:06}", id);
    let now = time();
    let profile = DoctorProfile {
        user_principal: principal,
        health_id: health_id.clone(),
        name,
        registered_at: now,
    };
    DOCTORS.with(|docs| docs.borrow_mut().push(profile.clone()));
    Ok(profile)
}

#[ic_cdk::query]
fn get_doctor_profile(principal: Principal) -> Option<DoctorProfile> {
    DOCTORS.with(|docs| docs.borrow().iter().find(|d| d.user_principal == principal).cloned())
}

#[ic_cdk::update]
pub fn register_patient(name: String, age: u8, gender: String) -> Result<PatientProfile, String> {
    patient::register_patient(name, age, gender)
}

#[ic_cdk::query]
pub fn get_patient_profile(principal: Principal) -> Option<PatientProfile> {
    patient::get_patient_profile(principal)
}

#[ic_cdk::query]
pub fn get_patient_by_health_id(health_id: String) -> Option<PatientProfile> {
    patient::get_patient_by_health_id(health_id)
}

// Export Candid
ic_cdk::export_candid!();
