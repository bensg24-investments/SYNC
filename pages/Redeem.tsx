import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Check, AlertCircle } from 'lucide-react';

const RedeemPage: React.FC = () => {
  const { user, redeemReward } = useApp();
  const [redeemedIds, setRedeemedIds] = useState<Set<string>>(new Set());

  const handleRedeem = (id: string, title: string, cost: number) => {
    const success = redeemReward(title, cost);
    if (success) {
      setRedeemedIds(prev => new Set(prev).add(id));
      // Optionally reset after a delay, but as requested, we'll keep it as "Redeemed!"
      // and disable it for this session/entry.
    }
  };
  
  const RewardCard = ({ id, title, pts, image }: any) => {
    const isRedeemed = redeemedIds.has(id);
    const canAfford = user ? user.totalPoints >= pts : false;

    return (
      <div className="bg-white rounded-[32px] p-5 shadow-sm border border-slate-100 flex flex-col items-center hover:shadow-md transition-all group">
        <div className={`w-full aspect-square rounded-[24px] mb-4 flex items-center justify-center text-4xl transition-all ${isRedeemed ? 'bg-green-50' : 'bg-slate-50 grayscale group-hover:grayscale-0'}`}>
          {isRedeemed ? <Check className="text-green-500 w-12 h-12" strokeWidth={3} /> : image}
        </div>
        <h4 className="text-sm font-black text-slate-800 mb-1 tracking-tight text-center">{title}</h4>
        <p className="text-[11px] font-black text-[#ff6b6b] mb-4 uppercase tracking-widest">{pts} pts</p>
        
        <button 
          onClick={() => handleRedeem(id, title, pts)}
          disabled={!canAfford || isRedeemed}
          className={`w-full text-[10px] font-black py-3 rounded-xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-1.5 ${
            isRedeemed 
              ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
              : canAfford 
                ? 'bg-[#1e293b] text-white hover:bg-slate-800 shadow-lg shadow-slate-100' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isRedeemed ? (
            <>
              <Check size={14} strokeWidth={3} />
              Redeemed!
            </>
          ) : !canAfford ? (
            'Not enough pts'
          ) : (
            `Redeem for ${pts}`
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-md mx-auto pb-32">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Redeem</h1>
        <p className="text-slate-400 text-sm font-black tracking-tight">Trade points for real rewards</p>
      </div>

      <div className="bg-white rounded-[44px] p-10 text-center border border-slate-100 shadow-2xl shadow-slate-100 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-2 relative z-10">Available Points</span>
        <span className="text-7xl font-black text-slate-800 tracking-tighter relative z-10 transition-all duration-700">
          {user?.totalPoints || 0}
        </span>
      </div>

      <div className="space-y-12">
        <section>
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 border-b border-slate-100 pb-4 flex items-center gap-2">
            <Check size={14} className="text-[#ff6b6b]" />
            Essentials (100 - 300 pts)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <RewardCard id="r1" title="Sync Sticker" pts={100} image="✨" />
            <RewardCard id="r2" title="Large Soda" pts={200} image="🥤" />
            <RewardCard id="r3" title="Ice Cream" pts={200} image="🍦" />
            <RewardCard id="r4" title="Large Fries" pts={300} image="🍟" />
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 border-b border-slate-100 pb-4 flex items-center gap-2">
            <AlertCircle size={14} className="text-[#ff6b6b]" />
            Premium Rewards (500+ pts)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <RewardCard id="r5" title="$5 Starbucks" pts={500} image="☕" />
            <RewardCard id="r6" title="$10 Bookstore" pts={1000} image="📚" />
            <RewardCard id="r7" title="Campus Hoodie" pts={2500} image="👕" />
            <RewardCard id="r8" title="Sync Pro Year" pts={5000} image="💎" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default RedeemPage;
