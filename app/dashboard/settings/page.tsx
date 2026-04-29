"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, User, Bell, Shield, Database } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function SettingsPage() {
    const [active, setActive] = useState<'profile' | 'notifications' | 'security' | 'privacy'>('profile');
    const router = useRouter();

    // Profile form state
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState('John Doe');
    const [role, setRole] = useState('Administrator');
    const [email, setEmail] = useState('admin@example.com');
    const [savingProfile, setSavingProfile] = useState(false);

    // Notifications state
    const [lowStockAlerts, setLowStockAlerts] = useState(false);
    const [weeklySummary, setWeeklySummary] = useState(false);
    const [savingNotifications, setSavingNotifications] = useState(false);

    // Security modals / flows
    const [showChangePwd, setShowChangePwd] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Privacy flows
    const [requestingExport, setRequestingExport] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleKey = (e: React.KeyboardEvent, tab: typeof active) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActive(tab);
        }
    };

    // Basic save handlers - these call APIs if available but degrade gracefully
    const saveProfile = async () => {
        setSavingProfile(true);
        try {
            await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, role, email })
            });
            setEditing(false);
            // optionally revalidate or show toast
        } catch (err) {
            console.error('Failed saving profile', err);
            alert('Could not save profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    const saveNotifications = async () => {
        setSavingNotifications(true);
        try {
            await fetch('/api/user/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lowStockAlerts, weeklySummary })
            });
        } catch (err) {
            console.error('Failed saving notifications', err);
            alert('Could not save notification preferences.');
        } finally {
            setSavingNotifications(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setChangingPassword(true);
        try {
            await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPassword, newPassword })
            });
            setShowChangePwd(false);
            setOldPassword(''); setNewPassword(''); setConfirmPassword('');
            alert('Password changed (if endpoint exists)');
        } catch (err) {
            console.error(err);
            alert('Could not change password.');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleRequestExport = async () => {
        setRequestingExport(true);
        try {
            await fetch('/api/user/export', { method: 'POST' });
            alert('Export requested. You will receive an email when ready.');
        } catch (err) {
            console.error(err);
            alert('Export request failed.');
        } finally {
            setRequestingExport(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            await fetch('/api/user', { method: 'DELETE' });
            alert('Account deleted (if endpoint exists). You will be redirected.');
            router.push('/');
        } catch (err) {
            console.error(err);
            alert('Delete failed.');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">Settings</h1>
                <p className="text-slate-500 font-medium italic mt-1 font-serif">Manage your application and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Tabs */}
                <div className="space-y-2">
                    <button
                        type="button"
                        role="tab"
                        aria-pressed={active === 'profile'}
                        onClick={() => setActive('profile')}
                        onKeyDown={(e) => handleKey(e, 'profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all ${active === 'profile' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
                        <User size={18} />
                        Profile
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-pressed={active === 'notifications'}
                        onClick={() => setActive('notifications')}
                        onKeyDown={(e) => handleKey(e, 'notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all ${active === 'notifications' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
                        <Bell size={18} />
                        Notifications
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-pressed={active === 'security'}
                        onClick={() => setActive('security')}
                        onKeyDown={(e) => handleKey(e, 'security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all ${active === 'security' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
                        <Shield size={18} />
                        Security
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-pressed={active === 'privacy'}
                        onClick={() => setActive('privacy')}
                        onKeyDown={(e) => handleKey(e, 'privacy')}
                        className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all ${active === 'privacy' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'}`}>
                        <Database size={18} />
                        Data & Privacy
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-2 space-y-6">
                    {active === 'profile' && (
                        <>
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-8">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Account Information</h2>
                                    <p className="text-slate-400 text-sm font-medium">Update your profile details and email address.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                            <input
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className={`w-full px-5 py-4 border rounded-2xl transition-all font-medium ${editing ? 'bg-white border-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}
                                                placeholder="John Doe"
                                                disabled={!editing}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
                                            <input
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                className={`w-full px-5 py-4 border rounded-2xl transition-all font-medium ${editing ? 'bg-white border-slate-200' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}
                                                placeholder="Administrator"
                                                disabled={!editing}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                        <input
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full px-5 py-4 border rounded-2xl transition-all font-medium ${editing ? 'bg-white border-slate-200' : 'bg-slate-50 border border-slate-100 text-slate-400'}`}
                                            placeholder="admin@example.com"
                                            disabled={!editing}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center gap-3">
                                    <div>
                                        {!editing && <span className="text-xs text-slate-400">Profile is read-only here — click Edit to modify.</span>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!editing ? (
                                            <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Edit</button>
                                        ) : (
                                            <>
                                                <button disabled={savingProfile} onClick={saveProfile} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">{savingProfile ? 'Saving...' : 'Save'}</button>
                                                <button onClick={() => { setEditing(false); /* reset to previous values if desired */ }} className="px-4 py-2 rounded-lg bg-slate-50 border">Cancel</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Email Notifications</h2>
                                        <p className="text-slate-400 text-xs font-medium">Receive alerts when stock is low.</p>
                                    </div>
                                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative shadow-inner">
                                        <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow font-bold" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {active === 'notifications' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Notifications</h2>
                                <p className="text-slate-500 text-sm mb-4">Manage how you receive notifications from the system.</p>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={lowStockAlerts}
                                            onChange={(e) => setLowStockAlerts(e.target.checked)}
                                        />
                                        <span className="font-medium text-slate-700">Low stock alerts (email)</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={weeklySummary}
                                            onChange={(e) => setWeeklySummary(e.target.checked)}
                                        />
                                        <span className="font-medium text-slate-700">Weekly summary</span>
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button disabled={savingNotifications} onClick={saveNotifications} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">{savingNotifications ? 'Saving...' : 'Save Preferences'}</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {active === 'security' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Security</h2>
                                <p className="text-slate-500 text-sm mb-4">Password and two-factor authentication settings.</p>
                                <div className="space-y-4">
                                    <button onClick={() => setShowChangePwd(true)} className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100">Change Password</button>
                                    <button className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100">Manage 2FA (not implemented)</button>
                                </div>
                            </div>

                            {showChangePwd && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                                        <h3 className="text-lg font-bold mb-4">Change Password</h3>
                                        <div className="space-y-3">
                                            <input type="password" placeholder="Current password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
                                            <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
                                            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
                                        </div>
                                        <div className="mt-4 flex justify-end gap-3">
                                            <button onClick={() => setShowChangePwd(false)} className="px-4 py-2 rounded border">Cancel</button>
                                            <button disabled={changingPassword} onClick={handleChangePassword} className="px-4 py-2 rounded bg-emerald-600 text-white">{changingPassword ? 'Saving...' : 'Change'}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {active === 'privacy' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Data & Privacy</h2>
                                <p className="text-slate-500 text-sm mb-4">Controls for data export and account deletion.</p>
                                <div className="space-y-4">
                                    <button disabled={requestingExport} onClick={handleRequestExport} className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100">{requestingExport ? 'Requesting...' : 'Request Data Export'}</button>
                                    <button disabled={deleting} onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600">{deleting ? 'Deleting...' : 'Delete Account'}</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAccount}
                title="Delete your account?"
                description="This action is irreversible. All your data, preferences, and account information will be permanently deleted from our servers."
                confirmLabel="Delete Account"
                loading={deleting}
            />
        </div>
    );
}
