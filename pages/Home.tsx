import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User, Zap, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DayOfWeek, ClassSchedule } from '../types';
import CheckInModal from '../components/CheckInModal';

const HomePage: React.FC = () => {
  const { user, checkIn } = useApp();
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  // Progress logic
  const dailyPoints = user?.dailyPoints || 0;
  const dailyGoal = user?.dailyGoal || 1000;
  const progressPercent = Math.min((dailyPoints / dailyGoal) * 100, 100);
  
  // SVG Progress Ring Config
  const size = 256;
  const center = size / 2;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  const getTodayAbbr = (): DayOfWeek => {
    const dayAbbrs: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayAbbrs[new Date().getDay()];
  };

  const todayAbbr = getTodayAbbr();
  const todayDateString = new Date().toDateString();

  const classesToday = user?.classes.filter(c => 
    c.daysOfWeek.some(day => day.toLowerCase() === todayAbbr.toLowerCase())
  ) || [];

  const handleOpenCheckIn = (c: ClassSchedule) => {
    setSelectedClass(c);
    setShowCheckInModal(true);
  };

  const handleConfirmCheckIn = (buddyIds: string[]) => {
    if (!selectedClass) return;
    
    const pts = 50 + (buddyIds.length * 10);
    setPointsAwarded(pts);
    
    checkIn(selectedClass.id, buddyIds.length);
    setShowCheckInModal(false);
    
    // Success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const ClassCard = ({ c }: { c: ClassSchedule }) => {
    const hasCheckedInToday = user?.lastCheckInDates[c.id] === todayDateString;
    
    return (
      <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-black text-[#ff6b6b] tracking-widest uppercase mb-1 block">Scheduled Class</span>
            <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">{c.name}</h3>
          </div>
          <div className="bg-blue-50 text-blue-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            +50 pts
          </div>
        </div>

        <div className="flex gap-5 text-slate-400 font-bold text-xs mb-8">
          <div className="flex items-center gap-2">
            <Clock size={16} strokeWidth={2.5} />
            <span>{c.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} strokeWidth={2.5} />
            <span>{c.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-3xl mb-8">
          <div className="flex -space-x-2">
            {['ER', 'KL', 'OT'].map((initials, idx) => (
              <div key={idx} className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[10px] text-white font-black">{initials}</div>
            ))}
          </div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Sync active with classmates</span>
        </div>

        {!hasCheckedInToday ? (
          <button 
            onClick={() => handleOpenCheckIn(c)}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-5 rounded-[24px] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] uppercase text-xs tracking-widest"
          >
            Check In Now
          </button>
        ) : (
          <div className="w-full bg-green-50 text-green-600 font-black py-5 rounded-[24px] text-center border border-green-100 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Checked In
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen pt-8 pb-32 max-w-md mx-auto">
      {/* Success Notification */}
      <div className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-all duration-500 ${showSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-slate-800 text-white p-8 rounded-[44px] shadow-2xl flex flex-col items-center gap-4 border border-white/10 backdrop-blur-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tighter">Class Synced!</h2>
          <div className="bg-white/10 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest text-[#ff6b6b]">
            +{pointsAwarded} Sync Points
          </div>
        </div>
      </div>

      {/* Header Area */}
      <div className="w-full px-8 grid grid-cols-3 items-center mb-12">
        <div className="flex-1" />
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Sync</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Credit where credit is due</p>
        </div>
        <div className="flex justify-end">
          <Link to="/profile" className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/50 shadow-sm active:scale-95 transition-transform">
            <User size={22} strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="relative flex items-center justify-center mb-10">
        <div className="absolute inset-0 bg-slate-100/50 rounded-full scale-[1.08] -z-10 blur-[1px]"></div>
        
        <div className="relative w-64 h-64">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90 block">
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-100" />
            <circle cx={center} cy={center} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-[#ff6b6b] progress-ring" />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[72px] font-black text-slate-800 leading-none tracking-tighter">{dailyPoints}</span>
            <div className="flex flex-col items-center -mt-1">
              <span className="text-xl font-black text-slate-300 tracking-tight">/{dailyGoal}</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Today's Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total Points Pill */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 bg-slate-100/60 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white shadow-sm">
          <Zap className="text-yellow-400 fill-yellow-400" size={16} />
          <span className="text-sm font-black text-slate-600 tracking-tight">{user?.totalPoints || 0} Total Sync Points</span>
        </div>
      </div>

      {/* Today's Schedule List */}
      <div className="w-full px-8">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Today's Schedule</h2>
          {classesToday.length > 0 && <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{classesToday.length} Classes</span>}
        </div>
        
        {classesToday.length > 0 ? (
          classesToday.map(c => <ClassCard key={c.id} c={c} />)
        ) : (
          <div className="bg-white rounded-[40px] p-12 text-center border border-slate-50 shadow-lg shadow-slate-100/50">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Clock size={32} />
            </div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest leading-relaxed">
              No classes scheduled for today.<br/>Enjoy your free time!
            </p>
          </div>
        )}
      </div>

      {/* Check In Modal */}
      {showCheckInModal && selectedClass && (
        <CheckInModal 
          currentClass={selectedClass}
          onClose={() => setShowCheckInModal(false)}
          onConfirm={handleConfirmCheckIn}
        />
      )}
    </div>
  );
};

export default HomePage;
