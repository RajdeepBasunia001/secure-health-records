import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Upload, Share2, Bell, Clock, History, UserSearch, ClipboardList, LogOut } from 'lucide-react';

const Sidebar = ({ role, onLogout }) => {
    const patientLinks = [
        { to: '/dashboard/patient/records', icon: <FileText size={20} />, label: 'My Records' },
        { to: '/dashboard/patient/upload', icon: <Upload size={20} />, label: 'Upload Record' },
        { to: '/dashboard/patient/share', icon: <Share2 size={20} />, label: 'Share Access' },
        { to: '/dashboard/patient/notifications', icon: <Bell size={20} />, label: 'Notifications' },
        { to: '/dashboard/patient/access-logs', icon: <Clock size={20} />, label: 'Access Logs' },
        { to: '/dashboard/patient/consent-history', icon: <History size={20} />, label: 'Consent History' },
    ];

    const doctorLinks = [
        { to: '/dashboard/doctor/requests', icon: <ClipboardList size={20} />, label: 'Patient Requests' },
        { to: '/dashboard/doctor/lookup', icon: <UserSearch size={20} />, label: 'Patient Lookup' },
        // { to: '/dashboard/doctor/upload-notes', icon: <FilePenLine size={20} />, label: 'Notes' },
    ];

    const links = role === 'patient' ? patientLinks : doctorLinks;

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white w-64 flex-shrink-0 transition-all duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">
                    {role === 'patient' ? 'P' : 'D'}
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight">SecureHealth</h1>
                    <p className="text-xs text-slate-400 capitalize">{role} Portal</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="mb-4">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Menu
                    </p>
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            {link.icon}
                            <span className="font-medium text-sm">{link.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
