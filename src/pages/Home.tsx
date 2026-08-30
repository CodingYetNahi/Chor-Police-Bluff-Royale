import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { gameEngine } from '../services/gameEngine';
import { sound } from '../services/soundService';
import { paymentService } from '../services/paymentService';
import {
  Shield,
  Users,
  KeyRound,
  Zap,
  Crown,
  Sparkles,
  Bot,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { ShareModal } from '../components/ShareModal';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { uid, alias } = useAuth();

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showHostPassModal, setShowHostPassModal] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);

  const activeEntitlement = paymentService.getActiveEntitlement(uid);
  const hasFreeTrial = paymentService.hasFreeTrialAvailable(uid);

  // Quick Match
  const handleQuickMatch = () => {
    sound.playActionSubmit();
    const room = gameEngine.requestQuickMatch(uid, alias);
    navigate(`/match/${room.id}`);
  };

  // Solo Practice Match (Human + 5 Bots immediately started)
  const handleSoloPractice = () => {
    sound.playActionSubmit();
    const room = gameEngine.createPrivateRoom(uid, alias, 'FILL_WITH_BOTS');
    gameEngine.startMatch(room.id, true);
    navigate(`/match/${room.id}`);
  };

  // Join by code
  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput || joinCodeInput.trim().length < 6) {
      setJoinError('Please enter a valid 6-character room code.');
      return;
    }

    sound.playActionSubmit();
    const res = gameEngine.joinRoomByCode(joinCodeInput.trim(), uid, alias);
    if (res.success && res.room) {
      setJoinError('');
      navigate(`/lobby/${res.room.id}`);
    } else {
      setJoinError(res.error || 'Unable to join room.');
    }
  };

  // Create Private Room
  const handleCreatePrivateRoomClick = () => {
    if (activeEntitlement) {
      // User has active pass
      proceedCreateRoom();
    } else if (hasFreeTrial) {
      // User gets free trial
      paymentService.claimFreeTrial(uid);
      proceedCreateRoom();
    } else {
      setShowHostPassModal(true);
    }
  };

  const proceedCreateRoom = () => {
    sound.playActionSubmit();
    const room = gameEngine.createPrivateRoom(uid, alias, 'FILL_WITH_BOTS');
    setCreatedRoomCode(room.code);
    navigate(`/lobby/${room.id}`);
  };

  // Host pass purchase
  const handlePurchaseHostPass = async () => {
    sound.playActionSubmit();
    try {
      const { order, isDevBypass } = await paymentService.createHostPassOrder(uid);

      if (isDevBypass) {
        // Instant test activation
        await paymentService.verifyAndActivatePass(
          uid,
          {
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_order_id: order.id,
            razorpay_signature: 'test_signature'
          },
          true
        );
        setShowHostPassModal(false);
        proceedCreateRoom();
      } else {
        // Open Razorpay Standard Checkout
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Chor Police: Bluff Royale',
          description: '2-Hour Private Room Host Pass',
          order_id: order.id,
          handler: async (response: any) => {
            const verifyRes = await paymentService.verifyAndActivatePass(uid, response, false);
            if (verifyRes.success) {
              setShowHostPassModal(false);
              proceedCreateRoom();
            }
          },
          theme: { color: '#f59e0b' }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classic Social Deduction — Reimagined</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Chor Police <span className="text-amber-400">Bluff Royale</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Six seats. One secret Chor, an authoritative Police inspector, an eyewitness Informer, and a vigilant Protector. Spot contradictions, defend your alibi, and vote before time expires.
          </p>

          {/* Quick Start Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleQuickMatch}
              className="py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              Quick Match (Instant)
            </button>

            <button
              onClick={handleSoloPractice}
              className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-bold text-sm flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              Solo Practice vs 5 Bots
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Play Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Private Room Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Users className="w-6 h-6" />
              </div>

              {activeEntitlement ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Host Pass Active
                </span>
              ) : hasFreeTrial ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  1st Room Free Trial
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Host Pass ₹29 / 2h
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-100">Create Private Room</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Play exclusively with friends via 6-digit room code. Customize bot-fill or humans-only rules.
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Invited friends join 100% free with no pass needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Custom seat filling policy (Bots / Humans Only)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreatePrivateRoomClick}
            className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition-all"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            Create Private Room
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Join Private Room Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 w-fit">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-100">Join With Room Code</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Received an invitation from a host? Enter the 6-character room code to take your seat.
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-3 pt-1">
              <div>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  maxLength={6}
                  placeholder="e.g. 7K2M9X"
                  className="w-full uppercase font-mono tracking-widest text-center text-lg font-bold bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 shadow-inner"
                />
                {joinError && <p className="text-xs text-red-400 mt-1.5 text-center">{joinError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
              >
                Join Friend's Room (Free)
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[11px] text-slate-500">
              Joining existing private rooms is always free for all players.
            </span>
          </div>
        </div>
      </div>

      {/* Feature Highlights Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">20 Unique Cases</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              From Royal Museum robberies to Silicon Valley server breaches.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Disclosed Rule Bots</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic rule engines with transparent BOT labels keep matches quick.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Zero Open Chat</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Structured forensic statements & questions prevent toxicity and abuse.
            </p>
          </div>
        </div>
      </div>

      {/* Host Pass Pricing Modal */}
      {showHostPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Crown className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-slate-100">2-Hour Private Host Pass</h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Unlock unlimited private room creation for 2 full hours. Your friends join 100% free.
              </p>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl my-4">
                <div className="text-3xl font-black text-amber-400">₹29</div>
                <div className="text-xs text-slate-400 mt-0.5">One-time pass • Valid for 2 hours • No subscription</div>
              </div>

              <div className="space-y-2 text-xs text-slate-400 text-left px-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Unlimited private rooms during your active window</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Secure Razorpay gateway checkout (Cards, UPI, Netbanking)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Public matchmaking remains always free</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={handlePurchaseHostPass}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm shadow-lg shadow-amber-950/60 transition-all"
              >
                Proceed to Secure Checkout (₹29)
              </button>

              <button
                onClick={() => setShowHostPassModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
