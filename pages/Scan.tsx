
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { Users, Info, CheckCircle, RefreshCcw, Search, X, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';

const AddBuddyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, performGroupSync, findUserById } = useApp();
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<{ name: string; uid: string; initials: string; classes: string[] } | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    setIsSearching(true);
    setError(null);
    
    try {
      if (searchId === user?.id) {
        setError("You cannot search for yourself!");
        return;
      }
      
      const userData = await findUserById(searchId);
      if (userData) {
        setFoundUser({
          uid: userData.uid,
          name: userData.name,
          initials: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          classes: ['General Study'] 
        });
      } else {
        setError("User not found. Check the ID and try again.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'PERMISSION_DENIED') {
        setError("Database access denied. Check security rules.");
      } else {
        setError("An error occurred during search.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const toggleClass = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const handleAddBuddy = async () => {
    if (!foundUser) return;
    setIsSyncing(true);
    try {
      await performGroupSync(foundUser.uid, selectedClasses);
      onClose();
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setError("Database access denied. Check security rules.");
      } else {
        setError(err.message || "Failed to add buddy.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-24 px-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white w-full max-w-sm rounded-[44px] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        <button onClick={onClose} className="absolute right-8 top-8 p-2 text-slate-300 hover:text-slate-500 transition-colors">
          <X size={24} strokeWidth={3} />
        </button>

        <h3 className="text-2xl font-black text-[#1e293b] tracking-tighter mb-8 pr-10">Add Buddy</h3>

        {!foundUser ? (
          <div className="space-y-6">
            <p className="text-slate-500 font-bold text-sm leading-relaxed">Enter a Friend UID to find them on Sync Code.</p>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="Paste UID here"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.trim())}
                  className="w-full bg-[#f8fafc] border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-800 font-black text-sm outline-none focus:border-red-400 focus:bg-white transition-all shadow-inner"
                  autoFocus
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchId.trim()}
                className="bg-[#1e293b] text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-slate-200 flex items-center justify-center min-w-[70px]"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
              </button>
            </div>
            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1 leading-tight">{error}</p>}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-8">
              <div className="w-16 h-16 rounded-full bg-[#ff6b6b] flex items-center justify-center text-xl font-black text-white shadow-lg shadow-red-100">
                {foundUser.initials}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1 truncate">{foundUser.name}</h4>
                <p className="text-slate-400 font-bold text-[10px] truncate">{foundUser.uid}</p>
              </div>
            </div>

            <div className="mb-10">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Confirm Shared Classes</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                {foundUser.classes.map(className => (
                  <button 
                    key={className}
                    onClick={() => toggleClass(className)}
                    className={`w-full flex justify-between items-center p-4 rounded-2xl border transition-all ${selectedClasses.includes(className) ? 'bg-white border-[#ff6b6b] shadow-md shadow-red-50' : 'bg-slate-50/50 border-slate-100'}`}
                  >
                    <span className={`text-sm font-black ${selectedClasses.includes(className) ? 'text-slate-800' : 'text-slate-400'}`}>
                      {className}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedClasses.includes(className) ? 'bg-[#ff6b6b] border-[#ff6b6b]' : 'border-slate-200 bg-white'}`}>
                      {selectedClasses.includes(className) && <Check size={12} className="text-white" strokeWidth={4} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-4 ml-1 leading-tight">{error}</p>}

            <button 
              onClick={handleAddBuddy}
              disabled={isSyncing}
              className="w-full bg-[#1e293b] text-white font-black py-5 rounded-[24px] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
            >
              {isSyncing ? <Loader2 size={16} className="animate-spin" /> : 'Add Buddy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ScanPage: React.FC = () => {
  const { user, performGroupSync } = useApp();
  const [activeTab, setActiveTab] = useState<'my-id' | 'scan-id'>('my-id');
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const isTransitioning = useRef(false);

  if (!user) return null;

  useEffect(() => {
    let isMounted = true;

    const manageScanner = async () => {
      if (activeTab === 'scan-id' && !syncSuccess && !showAddModal && !isProcessing) {
        if (isMounted) await startScanner();
      } else {
        if (isMounted) await stopScanner();
      }
    };

    manageScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [activeTab, syncSuccess, showAddModal, isProcessing]);

  const startScanner = async () => {
    if (isTransitioning.current) return;
    
    const container = document.getElementById("scanner-container");
    if (container) container.innerHTML = '';

    try {
      isTransitioning.current = true;
      const scanner = new Html5Qrcode("scanner-container");
      qrScannerRef.current = scanner;
      setScanError(null);
      
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScanSuccess(decodedText),
        () => {}
      );
    } catch (err) {
      if (err instanceof Error && !err.message.includes("transition")) {
        setScanError("Camera access denied or not found.");
      }
    } finally {
      isTransitioning.current = false;
    }
  };

  const stopScanner = async () => {
    if (isTransitioning.current) return;
    
    if (qrScannerRef.current) {
      try {
        isTransitioning.current = true;
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
        qrScannerRef.current = null;
        
        const container = document.getElementById("scanner-container");
        if (container) container.innerHTML = '';
      } catch (err) {
        qrScannerRef.current = null;
      } finally {
        isTransitioning.current = false;
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanError(null);
    
    try {
      await performGroupSync(decodedText);
      setSyncSuccess(decodedText);
      await stopScanner();
      setTimeout(() => setSyncSuccess(null), 5000);
    } catch (err: any) {
      if (err.message === 'PERMISSION_DENIED') {
        setScanError("Database access denied. Check security rules.");
      } else {
        setScanError(err.message || "Failed to sync with buddy.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-6 relative max-w-md mx-auto min-h-screen pb-32">
      <div className="mb-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">Scan</h1>
      </div>
      <p className="text-slate-400 text-sm font-black tracking-tight mb-8">Study together, earn together</p>

      {/* Navigation Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-[24px] flex relative mb-10 shadow-inner">
        <div 
          className={`absolute h-[calc(100%-12px)] w-[calc(50%-6px)] bg-white rounded-[18px] shadow-md transition-all duration-300 ease-out ${activeTab === 'scan-id' ? 'translate-x-full' : 'translate-x-0'}`}
        />
        <button 
          onClick={() => setActiveTab('my-id')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'my-id' ? 'text-slate-800' : 'text-slate-400'}`}
        >
          My ID
        </button>
        <button 
          onClick={() => setActiveTab('scan-id')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${activeTab === 'scan-id' ? 'text-slate-800' : 'text-slate-400'}`}
        >
          Scan ID
        </button>
      </div>

      {activeTab === 'my-id' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-white rounded-[44px] p-10 pb-14 shadow-2xl shadow-slate-200 border border-slate-50 mb-10 flex flex-col items-center">
             <div className="w-full bg-slate-50 rounded-[32px] p-10 border border-slate-100 shadow-inner mb-10 aspect-[3/4] flex items-center justify-center">
              <QRCode 
                value={user.id} 
                size={220} 
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
                fgColor="#1e293b"
              />
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-1 text-center">Your Unique ID</p>
            <h3 className="text-[10px] font-black text-slate-800 tracking-tight break-all text-center px-4">{user.id}</h3>
          </div>

          <div className="px-2">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Group Syncs</h4>
              <RefreshCcw size={14} className="text-slate-300" />
            </div>
            
            <div className="space-y-4">
              {user.syncHistory.length > 0 ? user.syncHistory.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-400">
                    <Users size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-black text-slate-800">Synced with {entry.name}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{getTimeAgo(entry.timestamp)}</p>
                  </div>
                  <div className="text-[#ff6b6b] font-black text-sm">+{entry.points} pts</div>
                </div>
              )) : (
                <div className="py-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                  <p className="text-slate-300 text-xs font-black uppercase tracking-widest">No recent syncs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative aspect-square w-full bg-slate-900 rounded-[44px] overflow-hidden mb-8 shadow-2xl">
            {syncSuccess ? (
              <div className="absolute inset-0 z-20 bg-green-500 flex flex-col items-center justify-center text-white p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Sync Success!</h3>
                <p className="font-bold text-white/80 truncate w-full">Connected with {syncSuccess}</p>
                <div className="mt-8 bg-black/10 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest">
                  +50 Points Earned
                </div>
              </div>
            ) : isProcessing ? (
              <div className="absolute inset-0 z-20 bg-slate-800/80 flex flex-col items-center justify-center text-white p-8 text-center">
                <Loader2 size={48} className="animate-spin mb-4" />
                <h3 className="text-xl font-black tracking-tight">Connecting...</h3>
                <p className="text-sm text-white/60 font-bold uppercase tracking-widest mt-2">Checking Permissions</p>
              </div>
            ) : (
              <>
                <div id="scanner-container" className="w-full h-full" />
                {!scanError && (
                   <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-[32px] relative">
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-400/30 animate-pulse" />
                    </div>
                  </div>
                )}
                {scanError && (
                   <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-center p-8 z-20">
                    <Info size={40} className="text-red-400 mb-4" />
                    <p className="text-white font-black text-sm uppercase tracking-widest mb-6 leading-relaxed px-4">{scanError}</p>
                    <button 
                      onClick={() => { setScanError(null); setIsProcessing(false); startScanner(); }}
                      className="px-8 py-3 bg-white text-slate-800 rounded-full font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-4 mb-10">
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full bg-[#1e293b] text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Users size={18} />
              Manually Add Friend
            </button>
          </div>
        </div>
      )}

      {showAddModal && <AddBuddyModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default ScanPage;
