import React, { useEffect, useState } from 'react';
import PatientStats from './PatientStats';
import { getPatientProfile, fetchAllDoctors, getConsentRequestsForProvider } from '../../../canisterApi'; // We might need a new API to get stats
import { getBackendActor } from '../../../dfinity';

const PatientOverview = ({ principal }) => {
    const [stats, setStats] = useState({
        totalRecords: 0,
        activeShared: 0,
        pendingRequests: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            if (!principal) return;
            try {
                const actor = await getBackendActor();
                const records = await actor.get_records(principal); // Self
                // For shared and pending, we need to query more data.
                // Currently traversing all APPOINTMENT_REQUESTS efficiently is hard without a specific query.
                // We'll trust the 'records' count for now.

                // Mocking some other stats or inferring if possible
                setStats({
                    totalRecords: records.length,
                    activeShared: 0, // Placeholder until we have a 'get_active_shares' API
                    pendingRequests: 0, // Placeholder
                });
            } catch (e) {
                console.error("Failed to load stats", e);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, [principal]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
            <PatientStats stats={stats} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <a href="/dashboard/patient/upload" className="btn-primary flex items-center gap-2 no-underline">
                        <span>Upload New Record</span>
                    </a>
                    <a href="/dashboard/patient/share" className="btn-secondary flex items-center gap-2 no-underline">
                        <span>Share Access</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PatientOverview;
