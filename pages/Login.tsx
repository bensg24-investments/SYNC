
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { useApp } from '../AppContext';
import { Scan, Mail, Lock, AlertCircle, ArrowRight, User } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSigningUp) {
        if (!fullName.trim()) {
          setError('Full Name is required for sign up.');
          setLoading(false);
          return;
        }
        await signup(email, password, fullName);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'PROFILE_DB_ERROR') {
        setError('Database error. Check security rules in Firebase.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'permission-denied') {
        setError('Database access denied. Check security rules.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        setError('Database access denied. Check security rules.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-24">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-white rounded-[28px] shadow-xl shadow-slate-200 flex items-center justify-center text-[#ff6b6b] mb-6">
            <Scan size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Sync Code</h1>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Connect. Earn. Excel.</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[44px] p-8 shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b6b]/5 rounded-full -mr-16 -mt-16"></div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">
            {isSigningUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSigningUp && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    required={isSigningUp}
                    placeholder="First Last"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all placeholder:text-slate-300"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@email.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-bold text-sm outline-none focus:bg-white focus:border-red-200 transition-all placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-[11px] font-black uppercase tracking-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e293b] text-white font-black py-5 rounded-[24px] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] uppercase text-xs tracking-widest flex items-center justify-center gap-2 group"
            >
              {loading ? 'Authenticating...' : (isSigningUp ? 'Join Sync Code' : 'Sign Into Sync')}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          {/* Google Sign In */}
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-slate-100 text-slate-600 font-black py-4 rounded-[24px] transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957273V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957273 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Toggle */}
        <p className="text-center text-slate-400 font-bold text-sm">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="text-[#ff6b6b] font-black hover:underline transition-all"
          >
            {isSigningUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
