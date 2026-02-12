import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ChevronLeft, Plus, Trash2, Clock, MapPin, X, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DayOfWeek, ClassSchedule } from '../types';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

const ClassesPage: React.FC = () => {
  const { user, addClass, removeClass, editClass } = useApp();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newClassName, setNewClassName] = useState('');
  const [newLoc, setNewLoc] = useState('');
  
  // Time state split into parts - defaulting to empty as requested
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [period, setPeriod] = useState('');
  
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);

  const resetForm = () => {
    setNewClassName('');
    setNewLoc('');
    setHour('');
    setMinute('');
    setPeriod('');
    setSelectedDays([]);
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleSave = () => {
    if (!newClassName || !newLoc || !hour || !minute || !period || selectedDays.length === 0) return;
    
    const finalTime = `${hour}:${minute} ${period}`;

    if (editingId) {
      editClass({
        id: editingId,
        name: newClassName,
        location: newLoc,
        time: finalTime,
        daysOfWeek: selectedDays,
        quantityPerWeek: selectedDays.length
      });
    } else {
      addClass({
        id: Math.random().toString(36).substr(2, 9),
        name: newClassName,
        location: newLoc,
        time: finalTime,
        daysOfWeek: selectedDays,
        quantityPerWeek: selectedDays.length
      });
    }
    
    resetForm();
  };

  const startEdit = (c: ClassSchedule) => {
    setEditingId(c.id);
    setNewClassName(c.name);
    setNewLoc(c.location);
    
    // Parse time string "08:00 AM"
    const [timeOnly, p] = c.time.split(' ');
    const [h, m] = timeOnly.split(':');
    
    setHour(h);
    setMinute(m);
    setPeriod(p);
    setSelectedDays(c.daysOfWeek);
    setShowAddForm(true);
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Validation helper
  const isFormValid = newClassName.trim() !== '' && 
                      newLoc.trim() !== '' && 
                      hour !== '' && 
                      minute !== '' && 
                      period !== '' && 
                      selectedDays.length > 0;

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen pb-32">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Your Classes</h1>
      </div>

      <div className="space-y-4 mb-8">
        {user.classes.map((c) => (
          <div key={c.id} className="bg-white rounded-[28px] p-5 shadow-sm border border-slate-100 flex justify-between items-center group transition-colors">
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">{c.name}</h3>
              <div className="flex flex-wrap gap-3 text-slate-400 text-[11px] font-bold">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{c.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{c.location}</span>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {DAYS.map(d => (
                  <span key={d} className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${c.daysOfWeek.includes(d) ? 'bg-red-50 text-red-400' : 'bg-slate-50 text-slate-200'}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => startEdit(c)}
                className="p-3 text-slate-300 hover:text-blue-400 transition-colors active:scale-90"
                title="Edit Class"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => removeClass(c.id)}
                className="p-3 text-slate-300 hover:text-red-400 transition-colors active:scale-90"
                title="Delete Class"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {user.classes.length === 0 && (
          <div className="bg-white rounded-[28px] p-10 text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-bold text-sm uppercase tracking-widest">No classes scheduled</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => { resetForm(); setShowAddForm(true); }}
        className="w-full bg-[#1e293b] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
      >
        <Plus size={20} />
        <span>Add New Class</span>
      </button>

      {/* Class Form Bottom Sheet (Add or Edit) */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={resetForm} />
          <div className="bg-white w-full max-w-md rounded-t-[32px] p-6 pb-10 relative z-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8 px-1">
              <h3 className="text-2xl font-black text-[#1e293b] tracking-tight">
                {editingId ? 'Edit Class' : 'New Class'}
              </h3>
              <button onClick={resetForm} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6 mb-10">
              {/* Class Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. UX Design 101"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all placeholder:text-slate-300"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Room 402"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all placeholder:text-slate-300"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                />
              </div>

              {/* Time Selection with Dropdowns */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Time</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <select 
                      value={hour} 
                      onChange={(e) => setHour(e.target.value)}
                      className={`w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 font-black text-sm outline-none focus:bg-white focus:border-red-200 transition-all ${hour === '' ? 'text-slate-300' : 'text-slate-800'}`}
                    >
                      <option value="" disabled>HH</option>
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <select 
                      value={minute} 
                      onChange={(e) => setMinute(e.target.value)}
                      className={`w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 font-black text-sm outline-none focus:bg-white focus:border-red-200 transition-all ${minute === '' ? 'text-slate-300' : 'text-slate-800'}`}
                    >
                      <option value="" disabled>MM</option>
                      {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <select 
                      value={period} 
                      onChange={(e) => setPeriod(e.target.value)}
                      className={`w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 font-black text-sm outline-none focus:bg-white focus:border-red-200 transition-all ${period === '' ? 'text-slate-300' : 'text-slate-800'}`}
                    >
                      <option value="" disabled>AM/PM</option>
                      {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-[9px] font-bold text-slate-300 ml-1 mt-1">Times are restricted to 15-minute increments.</p>
              </div>

              {/* Days Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Days of Week</label>
                <div className="flex justify-between gap-1 overflow-x-auto pb-2 scrollbar-hide">
                  {DAYS.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`flex-1 min-w-[44px] py-3 rounded-lg font-black text-[10px] uppercase transition-all border ${selectedDays.includes(d) ? 'bg-[#ff6b6b] text-white border-[#ff6b6b] shadow-md shadow-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave}
              disabled={!isFormValid}
              className="w-full bg-[#1e293b] text-white font-black py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 uppercase text-xs tracking-widest"
            >
              {editingId ? 'Update Class Schedule' : 'Save Class Schedule'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
