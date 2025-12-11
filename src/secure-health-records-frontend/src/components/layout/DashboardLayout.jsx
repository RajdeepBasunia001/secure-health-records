import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ role, user, onLogout }) => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar role={role} onLogout={onLogout} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 flex-shrink-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        Welcome back, {user?.name || 'User'}
                    </h2>
                    <div className="flex items-center gap-4">
                        {user?.health_id && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono border border-gray-200">
                                ID: {user.health_id}
                            </span>
                        )}
                        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
