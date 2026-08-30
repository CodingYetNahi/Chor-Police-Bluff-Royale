import React from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { Trophy, Award, Shield, CheckCircle2, Flame, History, RotateCcw } from 'lucide-react';
import { RoleBadge } from '../components/RoleBadge';

export const Stats: React.FC = () => {
  const { stats, alias } = useAuth();

  const winRate =
    stats.matchesPlayed > 0 ? Math.round((stats.wins / stats.matchesPlayed) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-mono text-amber-400">Career Dossier</span>
        <h1 className="text-3xl font-black text-slate-100">{alias}'s Records</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Rank progression, win statistics, accusation accuracy, and recent match history.
        </p>
      </div>

      {/* Rank Tier Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs uppercase font-mono text-amber-400">Current Rank Tier</span>
            <h2 className="text-2xl font-black text-slate-100">{stats.rankTier}</h2>
            <p className="text-xs text-slate-400">Lifetime Detective Score: {stats.currentScore} pts</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
          <div>
            <p className="text-2xl font-black text-emerald-400">{winRate}%</p>
            <p className="text-[11px] text-slate-400">Win Rate</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <p className="text-2xl font-black text-slate-100">{stats.matchesPlayed}</p>
            <p className="text-[11px] text-slate-400">Matches</p>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <p className="text-2xl font-black text-amber-400">{stats.wins}</p>
          <p className="text-xs text-slate-400 font-semibold">Total Victories</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <p className="text-2xl font-black text-blue-400">{stats.correctAccusations}</p>
          <p className="text-xs text-slate-400 font-semibold">Chor Accusations</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <p className="text-2xl font-black text-red-400">{stats.chorEscapes}</p>
          <p className="text-xs text-slate-400 font-semibold">Chor Escapes</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-1 flex flex-col justify-center items-center">
          <div className="mt-1">
            <RoleBadge role={stats.bestRole} size="sm" />
          </div>
          <p className="text-xs text-slate-400 font-semibold">Primary Role</p>
        </div>
      </div>

      {/* Recent Matches Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">Recent Matches (Last 5)</h2>
        </div>

        {stats.recentMatches.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No matches recorded yet. Launch a quick match or private room to earn points!
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recentMatches.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{m.caseTitle}</span>
                    <span className="text-[10px] text-slate-500">{m.date}</span>
                  </div>
                  <div>
                    <RoleBadge role={m.role} size="sm" />
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-xs ${
                      m.result === 'WIN'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.result}
                  </span>
                  <p className="font-mono font-bold text-amber-400 text-xs mt-1">+{m.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
