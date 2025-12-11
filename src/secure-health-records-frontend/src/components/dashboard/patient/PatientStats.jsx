import React from 'react';
import { FileText, Share2, AlertCircle } from 'lucide-react';

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

const PatientStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
                title="Total Records"
                value={stats?.totalRecords || 0}
                icon={FileText}
                colorClass="bg-blue-50 text-blue-600"
            />
            <StatCard
                title="Active Shared"
                value={stats?.activeShared || 0}
                icon={Share2}
                colorClass="bg-emerald-50 text-emerald-600"
            />
            <StatCard
                title="Pending Requests"
                value={stats?.pendingRequests || 0}
                icon={AlertCircle}
                colorClass="bg-amber-50 text-amber-600"
            />
        </div>
    );
};

export default PatientStats;
