import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { gameEngine } from '../services/gameEngine';
import { sound } from '../services/soundService';
import { Room, RoomPolicy } from '../types';
import { SeatAvatar } from '../components/SeatAvatar';
import { ShareModal } from '../components/ShareModal';
import {
  Users,
  Share2,
  Copy,
  Check,
  Crown,
  Play,
  CheckCircle2,
  AlertCircle,
  Bot,
  Settings2,
  LogOut
} from 'lucide-react';

export const Lobby: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { uid, alias } = useAuth();

  const [room, setRoom] = useState<Room | null>(() => (roomId ? gameEngine.getRoom(roomId) : null));
  const [copiedCode, setCopiedCode] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state & check if match started
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(() => {
      const current = gameEngine.getRoom(roomId);
      if (current) {
        setRoom({ ...current });
        if (current.status === 'IN_GAME') {
          navigate(`/match/${roomId}`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, navigate]);

  if (!room) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Room Not Found</h2>
        <p className="text-sm text-slate-400">The room session has ended or expired.</p>
        <button
          onClick={() => navigate('/')}
          className="py-2.5 px-6 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isHost = room.hostUid === uid;
  const currentSeat = room.seats.find((s) => s.uid === uid);

  const handleToggleReady = () => {
    sound.playActionSubmit();
    if (currentSeat) {
      currentSeat.isReady = !currentSeat.isReady;
      setRoom({ ...room });
    }
  };

  const handlePolicyChange = (policy: RoomPolicy) => {
    sound.playActionSubmit();
    gameEngine.updateRoomPolicy(room.id, uid, policy);
    setRoom({ ...room, policy });
  };

  const handleStartMatch = () => {
    sound.playActionSubmit();
    const res = gameEngine.startMatch(room.id, true);
    if (res.success && res.room) {
      setRoom({ ...res.room });
      navigate(`/match/${room.id}`);
    } else {
      setErrorMsg(res.error || 'Failed to start match.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      sound.playActionSubmit();
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?join=${room.code}` : '';
  const shareText = `Join my Chor Police: Bluff Royale match! Room code: ${room.code}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Lobby Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {room.isPrivate ? 'Private Room Lobby' : 'Public Lobby'}
            </span>
            {isHost && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Host
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            6-Player Deduction Lobby
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Seats fill with connected players. Unoccupied seats can be filled with labeled rule-based BOTs.
          </p>
        </div>

        {/* Room Code Card */}
        {room.isPrivate && (
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Room Code</p>
              <p className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-widest">
                {room.code}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleCopyCode}
                title="Copy Room Code"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all flex items-center gap-1 text-xs"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShareModalOpen(true)}
                title="Share Room Invite"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 text-xs"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Seats Grid */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100">Roster Table (6 Seats)</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {room.seats.filter((s) => s.uid).length} / 6 Seated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {room.seats.map((seat) => (
            <SeatAvatar
              key={seat.seatIndex}
              seat={seat}
              isCurrentUser={seat.uid === uid}
            />
          ))}
        </div>
      </div>

      {/* Host Controls & Policies */}
      {isHost && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Host Seat Filling Policy</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handlePolicyChange('FILL_WITH_BOTS')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                room.policy === 'FILL_WITH_BOTS'
                  ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-100 mb-1">
                <Bot className="w-4 h-4 text-amber-400" />
                Fill With Bots
              </div>
              <p className="text-xs text-slate-400">
                Immediately fills vacant seats with disclosed rule-based BOTs when you start.
              </p>
            </button>

            <button
              onClick={() => handlePolicyChange('HUMANS_ONLY')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                room.policy === 'HUMANS_ONLY'
                  ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-100 mb-1">
                <Users className="w-4 h-4 text-indigo-400" />
                Humans Only
              </div>
              <p className="text-xs text-slate-400">
                Requires all 6 seats to be taken by real human players before launching.
              </p>
            </button>

            <button
              onClick={() => handlePolicyChange('OPEN_REMAINING_SEATS')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                room.policy === 'OPEN_REMAINING_SEATS'
                  ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm text-slate-100 mb-1">
                <Crown className="w-4 h-4 text-emerald-400" />
                Open Remaining
              </div>
              <p className="text-xs text-slate-400">
                Gives invited friends priority, then opens remaining slots to public matchmaking.
              </p>
            </button>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Leave Lobby
        </button>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            onClick={handleToggleReady}
            className={`w-full sm:w-auto py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
              currentSeat?.isReady
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {currentSeat?.isReady ? 'Ready for Match' : 'Set Ready'}
          </button>

          {isHost && (
            <button
              onClick={handleStartMatch}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-950/60 transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              Launch Match Now
            </button>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Invite Players to Lobby"
        shareText={shareText}
        shareUrl={shareUrl}
      />
    </div>
  );
};
