
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ChevronLeft, Save, Trash2, AlertTriangle, Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user, updateSettings, deleteAccount, updateName, logout } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{message: string, show: boolean, error?: boolean}>({message: '', show: false});
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    if (newPassword && newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match", show: true, error: true });
      setTimeout(() => setToast({ message: '', show: false }), 3000);
      setIsSaving(false);
      return;
    }

    try {
      // Update name in Firebase & Firestore
      if (name !== user.name) {
        await updateName(name);
      }
      
      // Update Auth Settings (Password/Email Sync)
      await updateSettings(email, newPassword || undefined);
      
      setToast({ message: "Settings saved successfully!", show: true });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Failed to update settings";
      
      if (err.code === 'auth/requires-recent-login') {
        errorMessage = "Please re-login to change password";
      } else if (err.code === 'permission-denied') {
        errorMessage = "Database access denied. Check security rules.";
      } else if (err.message === 'PERMISSION_DENIED') {
        errorMessage = "Database access denied. Check security rules.";
      }
      
      setToast({ message: errorMessage, show: true, error: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast({ message: '', show: false }), 3000);
    }
  };

  const handleDelete = () => {
    deleteAccount();
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen pb-32">
      {/* Toast Notification */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
        <div className={`${toast.error ? 'bg-red-500' : 'bg-slate-800'} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3`}>
          {!toast.error && <div className="bg-green-500 rounded-full p-1"><Check size={14} /></div>}
          <span className="font-bold text-sm whitespace-nowrap">{toast.message}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/profile')} className="p-2 -ml-2 text-slate-600 active:scale-90 transition-transform">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Settings</h1>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Account Details</h3>
        
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              disabled
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-slate-400 font-bold text-sm outline-none cursor-not-allowed opacity-60"
            />
            <p className="text-[9px] font-bold text-slate-300 ml-1">Email cannot be changed directly.</p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-50">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">New Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Confirm Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#1e293b] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save size={18} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="mb-8">
        <button 
          onClick={handleLogout}
          className="w-full bg-white text-slate-800 border-2 border-slate-100 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
        >
          <LogOut size={20} className="text-[#ff6b6b]" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/50 rounded-[32px] p-6 border border-red-100 mb-24">
        <h3 className="text-xs font-black text-red-400 uppercase tracking-[0.2em] mb-4">Danger Zone</h3>
        <p className="text-[11px] font-bold text-slate-400 mb-6 leading-relaxed">
          Deleting your account will permanently remove all your progress, points, and class schedules. This action cannot be undone.
        </p>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-white text-red-500 border-2 border-red-100 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
        >
          <Trash2 size={18} />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative z-10 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Are you sure?</h3>
            <p className="text-slate-500 font-medium mb-8">This action is permanent and cannot be undone.</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 font-bold text-slate-400 py-4 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
