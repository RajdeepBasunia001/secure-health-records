import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory as backend_idl, canisterId as backend_id } from '../../declarations/secure-health-records-backend';

let backendActor = null;
let agent = null;
let initializing = null; // NEW: track initialization promise

// Create an agent and actor with the given identity (or anonymous if not provided)
export async function createBackendActor(identity) {
  agent = new HttpAgent({ host: 'http://localhost:4943', identity });
  if (identity) {
    try {
      console.log('Agent created with identity principal:', identity.getPrincipal().toText());
    } catch (e) {
      console.log('Agent created with identity, but could not get principal:', e);
    }
  } else {
    console.log('Agent created with anonymous identity');
  }
  // Always fetch root key on localhost, 127.0.0.1, or any *.localhost subdomain (for local development)
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.localhost')
  ) {
    try {
      await agent.fetchRootKey();
      console.log('fetchRootKey called after agent creation (local dev)');
    } catch (err) {
      console.warn('Could not fetch root key. Check that you are running a local replica:', err);
    }
  }
  backendActor = Actor.createActor(backend_idl, {
    agent,
    canisterId: backend_id,
  });
  return backendActor;
}

// Always returns a Promise that resolves to a ready backendActor
export async function getBackendActor() {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();
  return createBackendActor(identity);
}