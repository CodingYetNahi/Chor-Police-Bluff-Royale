import React from 'react';
import { Shield, Eye, Lock, Users, Sparkles, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { RoleBadge } from '../components/RoleBadge';

export const HowToPlay: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-mono text-amber-400">Rules & Strategy Guide</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">How to Play</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Chor Police: Bluff Royale is an original 6-player social deduction game where evidence and contradictions unmask the thief.
        </p>
      </div>

      {/* Core Rules Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          The 5 Secret Roles (6 Seats)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Every match features exactly six participants with strictly isolated confidential roles:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <RoleBadge role="CHOR" size="md" />
            <p className="text-xs text-slate-300">
              <strong className="text-red-400">Chor (The Thief):</strong> Knowingly holds the false alibi. Must blend in with plausible alibis, plant doubt, and avoid receiving the highest vote.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <RoleBadge role="POLICE" size="md" />
            <p className="text-xs text-slate-300">
              <strong className="text-blue-400">Police (The Inspector):</strong> Holds official forensic verification and can inspect one physical evidence item to expose contradictions.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <RoleBadge role="INFORMER" size="md" />
            <p className="text-xs text-slate-300">
              <strong className="text-emerald-400">Informer (The Secret Eye):</strong> Holds confidential eyewitness testimony. Must guide citizens toward the Chor without being falsely suspected.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <RoleBadge role="PROTECTOR" size="md" />
            <p className="text-xs text-slate-300">
              <strong className="text-purple-400">Protector (The Guardian):</strong> Can shield one suspected innocent player from elimination. Has zero effect on the Chor.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 md:col-span-2">
            <RoleBadge role="CITIZEN" size="md" />
            <p className="text-xs text-slate-300">
              <strong className="text-teal-400">Citizens (2 Investigators):</strong> Ordinary citizens who compare witness statements against public physical evidence to identify the liar.
            </p>
          </div>
        </div>
      </div>

      {/* 8-Phase Flow */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          The 8 Match Phases
        </h2>

        <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 1</span>
            <div>
              <strong className="text-slate-100">Case Briefing (12s):</strong> Read incident summary, location, stakes, and timeline.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 2</span>
            <div>
              <strong className="text-slate-100">Secret Role & Clue (15s):</strong> Privately view your assigned role and confidential clue.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 3</span>
            <div>
              <strong className="text-slate-100">Evidence Review (30s):</strong> Inspect the 4 public evidence cards and timeline logs.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 4</span>
            <div>
              <strong className="text-slate-100">Investigation (60s):</strong> Publish structured alibi statements, ask specific suspects targeted questions, or react with emojis.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 5</span>
            <div>
              <strong className="text-slate-100">Special Powers (15s):</strong> Police inspect forensic details, Protector shields an innocent player, Chor plants doubt.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 6</span>
            <div>
              <strong className="text-slate-100">Final Accusation (20s):</strong> Cast your final vote for the suspect you believe is the Chor.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 7</span>
            <div>
              <strong className="text-slate-100">The Reveal (15s):</strong> The Chor is unmasked, match winner announced, and points distributed.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex gap-3">
            <span className="font-mono font-bold text-amber-400 flex-shrink-0">Phase 8</span>
            <div>
              <strong className="text-slate-100">Rematch & Share:</strong> Share results with friends or start an immediate rematch with a new randomized case.
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Scoring Matrix
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-300">Correctly voting for the Chor</span>
            <span className="font-mono font-bold text-amber-400">+100 pts</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-300">Chor escapes unmasked</span>
            <span className="font-mono font-bold text-amber-400">+150 pts</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-300">Police side catches Chor</span>
            <span className="font-mono font-bold text-amber-400">+75 pts</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-300">Chor leads votes to innocent</span>
            <span className="font-mono font-bold text-amber-400">+50 pts</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-300">Informer escapes suspicion</span>
            <span className="font-mono font-bold text-amber-400">+40 pts</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
            <span className="text-slate-300">Protector saves accused innocent</span>
            <span className="font-mono font-bold text-amber-400">+40 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
