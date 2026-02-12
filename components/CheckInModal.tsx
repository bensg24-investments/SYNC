import React, { useState } from 'react';
import { X, Check, Users, MapPin } from 'lucide-react';
import { useApp } from '../AppContext';
import { ClassSchedule, Buddy } from '../types';

interface CheckInModalProps {
  currentClass: ClassSchedule;
  onClose: () => void;
  onConfirm: (buddyIds: string[]) => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ currentClass, onClose, onConfirm }) => {
  const { user } = useApp();
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);

  if (!user) return null;

  // Filter buddies who share this class
  const classBuddies = user.buddies.filter(b => 
    b.attendingClasses.some(className => className.toLowerCase() === currentClass.name.toLowerCase())
  );

  const toggleBuddy = (id: string) => {
    setSelectedBuddies(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const basePoints = 50;
  const coOpBonus = selectedBuddies.length * 10;
  const totalPoints = basePoints + coOpBonus;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-t-[44px] p-8 pb-10 relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1">{currentClass.name}</h3>
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase tracking-tight">
                <MapPin size={14} className="text-slate-300" />
                <span>{currentClass.location}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Score Card */}
        <div className="bg-slate-50 rounded-[32px] p-6 mb-8 border border-slate-100 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Base Points</span>
            <span className="text-sm font-black text-slate-800">+{basePoints}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Co-op Bonus</span>
            <span className="text-sm font-black text-[#ff6b6b]">+{coOpBonus}</span>
          </div>
          <div className="h-px bg-slate-200 my-1" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Total Earned</span>
            <span className="text-2xl font-black text-slate-800 tracking-tighter">{totalPoints} pts</span>
          </div>
        </div>

        {/* Classmates List */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Users size={16} className="text-slate-400" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classmates detected nearby</h4>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
            {classBuddies.length > 0 ? classBuddies.map((buddy: Buddy) => (
              <button 
                key={buddy.id}
                onClick={() => toggleBuddy(buddy.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all ${selectedBuddies.includes(buddy.id) ? 'bg-white border-[#ff6b6b] shadow-lg shadow-red-50' : 'bg-slate-50/50 border-slate-100'}`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black transition-colors ${selectedBuddies.includes(buddy.id) ? 'bg-[#ff6b6b] text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {buddy.initials}
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-black tracking-tight ${selectedBuddies.includes(buddy.id) ? 'text-slate-800' : 'text-slate-500'}`}>
                    {buddy.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ready to sync</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedBuddies.includes(buddy.id) ? 'bg-[#ff6b6b] border-[#ff6b6b]' : 'border-slate-200 bg-white'}`}>
                  {selectedBuddies.includes(buddy.id) && <Check size={14} className="text-white" strokeWidth={4} />}
                </div>
              </button>
            )) : (
              <div className="py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No classmates detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onConfirm(selectedBuddies)}
          className="w-full bg-[#1e293b] text-white font-black py-5 rounded-[24px] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
        >
          {selectedBuddies.length > 0 
            ? `Check In with ${selectedBuddies.length} Friend${selectedBuddies.length > 1 ? 's' : ''}` 
            : 'Check In Solo'}
        </button>
      </div>
    </div>
  );
};

export default CheckInModal;
