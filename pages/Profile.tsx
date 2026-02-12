import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Settings, BookOpen, Users, TrendingUp, Calendar, ChevronLeft, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, getInitials, updateDailyGoal } = useApp();
  const navigate = useNavigate();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState(user?.dailyGoal?.toString() || '1000');
  const [toast, setToast] = useState<{message: string, show: boolean}>({message: '', show: false});

  if (!user) return null;

  const handleSaveGoal = () => {
    const goalNum = parseInt(newGoal);
    if (!isNaN(goalNum) && goalNum > 0) {
      updateDailyGoal(goalNum);
      setShowGoalModal(false);
      setToast({ message: `Daily goal updated to ${goalNum}!`, show: true });
      setTimeout(() => setToast({ message: '', show: false }), 3000);
    }
  };

  const StatCard = ({ icon: Icon, label, value, sublabel, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="bg-white rounded-[32px] p-6 shadow-sm flex flex-col items-start text-left border border-slate-100 hover:shadow-lg transition-all active:scale-[0.98]"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{label}</span>
      <span className="text-3xl font-black text-slate-800 leading-none">{value}</span>
      <span className="text-slate-400 text-[10px] font-bold mt-1">{sublabel}</span>
    </button>
  );

  return (
    <div className="p-6 relative max-w-md mx-auto">
      {/* Toast Notification */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}>
        <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
          <div className="bg-green-500 rounded-full p-1"><Check size={14} /></div>
          <span className="font-black text-sm whitespace-nowrap">{toast.message}</span>
        </div>
      </div>

      {/* Header with Back Arrow */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
            <ChevronLeft size={28} strokeWidth={3} />
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profile</h1>
        </div>
        <Link to="/settings" className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
          <Settings size={26} strokeWidth={2.5} />
        </Link>
      </div>

      <p className="text-slate-400 text-sm font-black tracking-tight mb-8">Your Sync journey</p>

      {/* Profile Header Card - Level System Removed */}
      <div className="bg-gradient-to-br from-[#4ea7a1] via-[#86918d] to-[#e68371] rounded-[44px] p-8 text-white mb-8 shadow-2xl shadow-slate-200 relative overflow-hidden">
        <div className="flex items-center gap-6 mb-10 relative z-10">
          <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-4xl font-black tracking-tighter backdrop-blur-md">
            {getInitials()}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black mb-1 leading-none tracking-tight">{user.name}</h2>
            <p className="text-white/80 font-bold text-sm mb-4">{user.major}</p>
            <div className="flex gap-2">
              <span className="bg-black/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-wider">{user.streak} day streak</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] p-6 relative z-10">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Total Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tighter">{user.totalPoints}</span>
            <span className="text-lg font-black text-white/60 tracking-tight">Sync Points</span>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <StatCard 
          icon={Calendar} 
          label="Classes" 
          value={user.classes.length * 9} 
          sublabel="Check-ins" 
          color="bg-blue-400"
          onClick={() => navigate('/classes')}
        />
        <StatCard 
          icon={BookOpen} 
          label="Study" 
          value={user.totalSessions} 
          sublabel="Sessions" 
          color="bg-red-400"
          onClick={() => navigate('/study')}
        />
        <StatCard 
          icon={Users} 
          label="Friends" 
          value={user.friendsCount} 
          sublabel="Connected" 
          color="bg-orange-400"
          onClick={() => navigate('/scan')}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Today" 
          value={user.dailyPoints} 
          sublabel="Points" 
          color="bg-teal-400"
          onClick={() => setShowGoalModal(true)}
        />
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowGoalModal(false)} />
          <div className="bg-white w-full max-w-sm rounded-[44px] p-8 shadow-2xl relative z-10">
            <h3 className="text-2xl font-black text-slate-800 mb-2">Today's Goal</h3>
            <p className="text-slate-500 font-bold text-sm mb-6">What is your goal for today?</p>
            
            <div className="relative mb-8">
              <input 
                type="number" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-3xl font-black text-slate-800 outline-none focus:border-red-400 focus:bg-white transition-all"
                autoFocus
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase tracking-widest text-sm">pts</span>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowGoalModal(false)}
                className="flex-1 font-black text-slate-400 py-4 rounded-2xl hover:bg-slate-50 transition-colors uppercase text-xs tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveGoal}
                className="flex-1 bg-[#ff6b6b] text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-500 transition-all active:scale-95 uppercase text-xs tracking-widest"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
