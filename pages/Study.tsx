
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { CheckCircle, Clock, Star } from 'lucide-react';
import StudyLogModal from '../components/StudyLogModal';

const StudyPage: React.FC = () => {
  const { user, logStudySession } = useApp();
  const [duration, setDuration] = useState<number>(30);
  const [isCustom, setIsCustom] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  if (!user) return null;

  const handleConfirmLog = (buddyIds: string[]) => {
    // Calculate pts to show in success animation locally for immediate feedback
    const basePoints = Math.floor(duration / 30) * 10;
    let bonus = 0;
    buddyIds.forEach(id => {
      const b = user.buddies.find(buddy => buddy.id === id);
      if (b) {
        bonus += (b.sharedClasses && b.sharedClasses.length > 0) ? 20 : 10;
      }
    });

    const total = basePoints + bonus;
    setEarnedPoints(total);
    logStudySession(duration, buddyIds);
    
    setShowLogModal(false);
    setShowSuccess(true);
    
    // Reset page state after success
    setTimeout(() => {
      setShowSuccess(false);
      setDuration(30);
      setIsCustom(false);
    }, 4000);
  };

  const TimePill = ({ val, label }: { val: number, label: string }) => (
    <button
      onClick={() => { setDuration(val); setIsCustom(false); }}
      className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!isCustom && duration === val ? 'bg-[#ff6b6b] text-white shadow-lg shadow-red-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen pb-32">
      {/* Success Notification Overlay */}
      <div className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-all duration-500 ${showSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-slate-800 text-white p-8 rounded-[44px] shadow-2xl flex flex-col items-center gap-4 border border-white/10 backdrop-blur-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter">Session Logged!</h2>
          <div className="bg-white/10 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest text-[#ff6b6b]">
            +{earnedPoints} Sync Points
          </div>
        </div>
      </div>

      <div className="mb-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Study</h1>
      </div>
      <p className="text-slate-400 text-sm font-black tracking-tight mb-8">Log your study time and earn</p>

      {/* Stats Banner */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] p-8 text-white mb-10 shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Today's Study Points</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tighter">{user.dailyStudyPoints}</span>
          <span className="text-sm font-bold text-white/60">pts earned</span>
        </div>
      </div>

      {/* Time Selection */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Study Duration</h3>
          {isCustom && <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">{duration} Minutes</span>}
        </div>
        
        {!isCustom ? (
          <div className="flex gap-3">
            <TimePill val={30} label="30m" />
            <TimePill val={60} label="1h" />
            <TimePill val={120} label="2h" />
            <button 
              onClick={() => setIsCustom(true)}
              className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100"
            >
              Custom
            </button>
          </div>
        ) : (
          <div className="relative">
            <input 
              type="number" 
              autoFocus
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-3xl font-black text-slate-800 outline-none focus:border-red-400 focus:bg-white transition-all"
            />
            <button 
              onClick={() => { setIsCustom(false); setDuration(30); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-red-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Primary Log Button - Moved Up */}
      <button
        onClick={() => setShowLogModal(true)}
        disabled={duration <= 0 || showSuccess}
        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-6 rounded-[28px] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 mb-10"
      >
        <Clock size={18} />
        Log Session
      </button>

      <div className="flex items-center gap-3 bg-blue-50 p-6 rounded-[32px] border border-blue-100">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
          <Star size={16} fill="white" />
        </div>
        <p className="text-[11px] font-black text-blue-500 uppercase tracking-tight leading-relaxed">
          Tip: Studying with classmates grants <span className="text-blue-700">+20 bonus points</span> instead of +10! Use Group Sync to connect with more friends.
        </p>
      </div>

      {showLogModal && (
        <StudyLogModal 
          duration={duration}
          onClose={() => setShowLogModal(false)}
          onConfirm={handleConfirmLog}
        />
      )}
    </div>
  );
};

export default StudyPage;
