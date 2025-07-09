use candid::{CandidType, Principal};
use ic_cdk::api::time;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct PatientProfile {
    pub user_principal: Principal,
    pub health_id: String,
    pub name: String,
    pub age: u8,
    pub gender: String,
    pub registered_at: u64,
}

thread_local! {
    static PATIENTS: std::cell::RefCell<Vec<PatientProfile>> = std::cell::RefCell::new(Vec::new());
    static NEXT_PATIENT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(1);
}

pub fn register_patient(name: String, age: u8, gender: String) -> Result<PatientProfile, String> {
    ic_cdk::println!("[DEBUG] register_patient called: name={}, age={}, gender={}", name, age, gender);
    let principal = ic_cdk::caller();
    // Check if already registered
    let already = PATIENTS.with(|pats| pats.borrow().iter().any(|p| p.user_principal == principal));
    if already {
        return Err("Patient already registered".to_string());
    }
    // Generate unique health ID
    let id = NEXT_PATIENT_ID.with(|n| {
        let mut n = n.borrow_mut();
        let id = *n;
        *n += 1;
        id
    });
    let health_id = format!("PAT-{:06}", id);
    let now = time();
    let profile = PatientProfile {
        user_principal: principal,
        health_id: health_id.clone(),
        name,
        age,
        gender,
        registered_at: now,
    };
    PATIENTS.with(|pats| pats.borrow_mut().push(profile.clone()));
    Ok(profile)
}

pub fn get_patient_profile(principal: Principal) -> Option<PatientProfile> {
    PATIENTS.with(|pats| pats.borrow().iter().find(|p| p.user_principal == principal).cloned())
}

pub fn get_patient_by_health_id(health_id: String) -> Option<PatientProfile> {
    PATIENTS.with(|pats| pats.borrow().iter().find(|p| p.health_id == health_id).cloned())
} 