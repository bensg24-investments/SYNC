
import React, { useState } from 'react';
import { X, User, Users, Check, Star } from 'lucide-react';
import { useApp } from '../AppContext';

interface StudyLogModalProps {
  duration: number;
  onClose: () => void;
  onConfirm: (buddyIds: string[]) => void;
}

const StudyLogModal: React.FC<StudyLogModalProps> = ({ duration, onClose, onConfirm }) => {
  const { user } = useApp();
  const [step, setStep] = useState<'CHOICE' | 'BUDDIES'>('CHOICE');
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);

  if (!user) return null;

  const toggleBuddy = (id: string) => {
    setSelectedBuddies(prev => 
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const basePoints = Math.floor(duration / 30) * 10;
  
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-t-[44px] p-8 pb-12 relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tighter leading-none mb-1">
              {step === 'CHOICE' ? 'Session Complete?' : 'Select Buddies'}
            </h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              {duration}m Session • {basePoints} Base Pts
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        {step === 'CHOICE' ? (
          <div className="space-y-4">
            <p className="text-slate-500 font-bold text-sm mb-6 px-1">Did you study with anyone today? Social studying earns you significant bonus points!</p>
            
            <button 
              onClick={() => onConfirm([])}
              className="w-full flex items-center gap-6 p-6 rounded-[32px] border-2 border-slate-100 hover:border-slate-200 bg-white group transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                <User size={28} />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Studied Alone</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commit Base Points</p>
              </div>
            </button>

            <button 
              onClick={() => setStep('BUDDIES')}
              className="w-full flex items-center gap-6 p-6 rounded-[32px] border-2 border-[#ff6b6b]/10 bg-red-50/30 hover:bg-red-50 group transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 bg-[#ff6b6b] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                <Users size={28} />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">With Buddies</h4>
                <p className="text-[10px] font-black text-[#ff6b6b] uppercase tracking-widest">Earn Collaboration Bonuses</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-hide mb-10">
              {user.buddies.length > 0 ? user.buddies.map((buddy) => (
                <button 
                  key={buddy.id}
                  onClick={() => toggleBuddy(buddy.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all ${selectedBuddies.includes(buddy.id) ? 'bg-white border-[#ff6b6b] shadow-lg shadow-red-50' : 'bg-slate-50/50 border-slate-100'}`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black transition-colors ${selectedBuddies.includes(buddy.id) ? 'bg-[#ff6b6b] text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {buddy.initials}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className={`text-sm font-black tracking-tight truncate ${selectedBuddies.includes(buddy.id) ? 'text-slate-800' : 'text-slate-500'}`}>
                      {buddy.name}
                    </p>
                    {buddy.sharedClasses && buddy.sharedClasses.length > 0 ? (
                       <div className="flex items-center gap-1 mt-0.5">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Classmate (+20 pts)</span>
                      </div>
                    ) : (
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Buddy (+10 pts)</p>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selectedBuddies.includes(buddy.id) ? 'bg-[#ff6b6b] border-[#ff6b6b]' : 'border-slate-200 bg-white'}`}>
                    {selectedBuddies.includes(buddy.id) && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                </button>
              )) : (
                <div className="py-12 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No friends found. Use Group Sync first!</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep('CHOICE')}
                className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => onConfirm(selectedBuddies)}
                className="flex-[2] bg-[#1e293b] text-white font-black py-5 rounded-[24px] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all uppercase text-[10px] tracking-widest"
              >
                {selectedBuddies.length > 0 ? `Confirm with ${selectedBuddies.length} Friends` : 'Confirm Solo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyLogModal;
