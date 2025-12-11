import React, { useEffect, useState } from 'react';
import { getBackendActor } from '../../../dfinity';
import { Users, ClipboardList, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon size={24} />
        </div>
    </div>
);

const DoctorOverview = ({ profile }) => {
    const [stats, setStats] = useState({
        activePatients: 0,
        pendingRequests: 0,
        completedAppts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            if (!profile?.health_id) return;
            try {
                const actor = await getBackendActor();
                // We fetch all requests to calculate stats locally
                // ideally backend has a 'get_dashboard_stats' method
                const requests = await actor.get_doctor_appointments(profile.health_id);

                const pending = requests.filter(r => r.status === 'pending').length;
                const active = requests.filter(r => r.status === 'approved' && r.request_type === 'consent').length;
                const completed = requests.filter(r => r.status === 'completed').length; // Assuming 'completed' status exists for appts

                setStats({
                    activePatients: active,
                    pendingRequests: pending,
                    completedAppts: completed
                });
            } catch (e) {
                console.error("Failed to load doctor stats", e);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, [profile]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Pending Requests"
                    value={stats.pendingRequests}
                    icon={ClipboardList}
                    colorClass="bg-amber-50 text-amber-600"
                />
                <StatCard
                    title="Active Patients"
                    value={stats.activePatients}
                    icon={Users}
                    colorClass="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    title="Completed Appointments"
                    value={stats.completedAppts}
                    icon={CheckCircle}
                    colorClass="bg-emerald-50 text-emerald-600"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Welcome, Dr. {profile.name}</h3>
                <p className="text-gray-600">
                    You can manage your patient appointments and view their health records from the sidebar menu.
                    Check "Patient Requests" to approve new access requests.
                </p>
            </div>
        </div>
    );
};

export default DoctorOverview;
