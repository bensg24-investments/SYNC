
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Home, User, BookOpen, Gift, Scan } from 'lucide-react';
import HomePage from './pages/Home';
import ProfilePage from './pages/Profile';
import ClassesPage from './pages/Classes';
import StudyPage from './pages/Study';
import ScanPage from './pages/Scan';
import RedeemPage from './pages/Redeem';
import SettingsPage from './pages/Settings';
import { useApp } from './AppContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <Link to="/" className={`flex flex-col items-center gap-1.5 transition-colors ${isActive('/') ? 'text-[#ff6b6b]' : 'text-slate-300'}`}>
        <Home size={22} strokeWidth={isActive('/') ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
      </Link>
      <Link to="/scan" className={`flex flex-col items-center gap-1.5 transition-colors ${isActive('/scan') ? 'text-[#ff6b6b]' : 'text-slate-300'}`}>
        <Scan size={22} strokeWidth={isActive('/scan') ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-tighter">Scan</span>
      </Link>
      <Link to="/study" className={`flex flex-col items-center gap-1.5 transition-colors ${isActive('/study') ? 'text-[#ff6b6b]' : 'text-slate-300'}`}>
        <BookOpen size={22} strokeWidth={isActive('/study') ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-tighter">Study</span>
      </Link>
      <Link to="/redeem" className={`flex flex-col items-center gap-1.5 transition-colors ${isActive('/redeem') ? 'text-[#ff6b6b]' : 'text-slate-300'}`}>
        <Gift size={22} strokeWidth={isActive('/redeem') ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-tighter">Redeem</span>
      </Link>
    </nav>
  );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  
  if (!user) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
          <Scan size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Sync Code</h1>
        <p className="text-slate-500 font-medium mb-8">You are currently logged out. Refresh to start a new session.</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-[#1e293b] text-white font-black py-4 rounded-2xl shadow-xl"
        >
          Restart App
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative overflow-x-hidden shadow-2xl shadow-slate-200">
      <div className="min-h-screen">
        {children}
      </div>
      <Navigation />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
