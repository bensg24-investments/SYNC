
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
import LoginPage from './pages/Login';
import { useApp } from './AppContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto w-full flex justify-between items-center">
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
      </div>
    </nav>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-white relative overflow-x-hidden shadow-2xl shadow-slate-200 flex flex-col">
      <div className="flex-1 pb-32">
        {children}
      </div>
      <Navigation />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
        <Route path="/study" element={<ProtectedRoute><StudyPage /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
        <Route path="/redeem" element={<ProtectedRoute><RedeemPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
