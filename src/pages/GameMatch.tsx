import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../features/auth/AuthContext';
import { gameEngine } from '../services/gameEngine';
import { sound } from '../services/soundService';
import {
  Case,
  EvidenceItem,
  GamePhase,
  PrivatePlayerState,
  Role,
  Room,
  StructuredActionType
} from '../types';
import { SEED_CASES } from '../content/cases';
import { PhaseTimer } from '../components/PhaseTimer';
import { SeatAvatar } from '../components/SeatAvatar';
import { RoleBadge } from '../components/RoleBadge';
import { EvidenceViewerModal } from '../components/EvidenceViewerModal';
import { ShareModal } from '../components/ShareModal';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Users,
  Search,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Trophy,
  RotateCcw,
  Share2,
  Home as HomeIcon,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  FileText,
  Target,
  Zap
} from 'lucide-react';

export const GameMatch: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { uid, alias, recordMatchResult } = useAuth();

  const [room, setRoom] = useState<Room | null>(() => (roomId ? gameEngine.getRoom(roomId) : null));
  const [privateState, setPrivateState] = useState<PrivatePlayerState | null>(() =>
    roomId ? gameEngine.getPrivateState(roomId, uid) : null
  );

  // Privacy toggle on role reveal screen
  const [hideRoleForPrivacy, setHideRoleForPrivacy] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Investigation Phase Inputs
  const [selectedActionCategory, setSelectedActionCategory] = useState<'STATEMENT' | 'QUESTION' | 'SUSPICION' | 'DEFENSE' | 'EMOJI'>('DEFENSE');
  const [targetSeatIndex, setTargetSeatIndex] = useState<number | null>(null);
  const [selectedStatementText, setSelectedStatementText] = useState('');
  const [selectedQuestionText, setSelectedQuestionText] = useState('');
  const [selectedDefenseText, setSelectedDefenseText] = useState('');
  const [selectedSuspicionReasonId, setSelectedSuspicionReasonId] = useState('susp-contra-evidence');
  const [logFilter, setLogFilter] = useState<'ALL' | 'DEFENSE' | 'SUSPICION' | 'QUESTION' | 'STATEMENT'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Special Action Phase States
  const [specialActionEvidenceId, setSpecialActionEvidenceId] = useState<string>('');
  const [specialActionProtectSeat, setSpecialActionProtectSeat] = useState<number | null>(null);
  const [specialActionDoubtText, setSpecialActionDoubtText] = useState<string>('');
  const [specialActionSubmitted, setSpecialActionSubmitted] = useState(false);

  // Voting Phase State
  const [selectedVoteSeatIndex, setSelectedVoteSeatIndex] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Result recorded state to avoid duplicate points
  const [resultRecorded, setResultRecorded] = useState(false);

  const activeCase: Case = room?.caseData || SEED_CASES.find((c) => c.id === room?.caseId) || SEED_CASES[0];

  // Sync loop
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(() => {
      const current = gameEngine.getRoom(roomId);
      if (current) {
        setRoom({ ...current });
        const pState = gameEngine.getPrivateState(roomId, uid);
        if (pState) setPrivateState({ ...pState });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, uid]);

  // Phase transition & sound triggers
  useEffect(() => {
    if (!room) return;

    sound.playPhaseStart();

    if (room.currentPhase === 'REVEAL') {
      sound.playRevealChor();

      const userRole = privateState?.role;
      const userWon =
        (room.result?.winningTeam === 'CHOR_SIDE' && userRole === 'CHOR') ||
        (room.result?.winningTeam === 'POLICE_SIDE' && userRole !== 'CHOR');

      if (userWon) {
        sound.playVictory();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      } else {
        sound.playDefeat();
      }

      // Record lifetime statistics
      if (!resultRecorded && room.result && userRole) {
        setResultRecorded(true);
        const mySeat = room.seats.find((s) => s.uid === uid);
        const myPoints = mySeat?.scoreEarned || 20;
        const didAccuse = mySeat?.suspectVotedFor === room.result.chorSeatIndex;
        const didEscape = userRole === 'CHOR' && room.result.winningTeam === 'CHOR_SIDE';

        recordMatchResult({
          matchId: room.id,
          caseTitle: activeCase.title,
          role: userRole,
          result: userWon ? 'WIN' : 'LOSS',
          points: myPoints,
          didAccuseChor: didAccuse,
          didEscapeAsChor: didEscape
        });
      }
    }
  }, [room?.currentPhase]);

  if (!room || !privateState) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Synchronizing Match...</h2>
        <p className="text-xs text-slate-400">Loading server-authoritative game state.</p>
        <button
          onClick={() => navigate('/')}
          className="py-2.5 px-6 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const currentUserSeat = room.seats.find((s) => s.uid === uid);

  // Handle phase timer expiration
  const handleTimerExpired = () => {
    if (room.currentPhase !== 'REMATCH') {
      const advanced = gameEngine.advancePhase(room.id);
      if (advanced) setRoom({ ...advanced });
    }
  };

  // Curated Defense Options
  const getDefenseOptions = () => {
    if (!privateState) return [];
    const roleAlibi =
      privateState.role === 'CHOR'
        ? activeCase.roleClues.chorCoverClue
        : privateState.role === 'POLICE'
        ? `Official police logs verify my forensic investigation duty during the incident.`
        : privateState.role === 'INFORMER'
        ? `I was situated as an eyewitness near the perimeter and observed the scene safely.`
        : privateState.role === 'PROTECTOR'
        ? activeCase.roleClues.protectorDefenseClue || `I was actively monitoring the perimeter without leaving my post.`
        : (activeCase.allowedStatements.find((s) => s.roleTypeHint === 'CITIZEN')?.text ||
           `I was present at the designated guest area continuously without leaving.`);

    return [
      {
        id: 'def-role-alibi',
        tag: 'Role Alibi',
        categoryLabel: '📜 Confidential Alibi',
        text: roleAlibi,
        rationale: 'Cites your direct confidential role assignment and observed alibi.'
      },
      {
        id: 'def-location-registry',
        tag: 'Location Log',
        categoryLabel: '📍 Location Verification',
        text: `My presence at ${activeCase.location} was registered in the official registry logs during the incident window.`,
        rationale: 'Points to official building registry logs that corroborate your location.'
      },
      {
        id: 'def-witness-corroboration',
        tag: 'Witness Alibi',
        categoryLabel: '👥 Witness Corroboration',
        text: `Independent witnesses and staff observed me continuously at my post throughout the critical timeline window.`,
        rationale: 'Appeals to third-party witness statements.'
      },
      {
        id: 'def-forensic-exclusion',
        tag: 'Forensic Proof',
        categoryLabel: '🔬 Forensic Exclusion',
        text: `Physical forensic analysis rules out my fingerprints, badge swipes, and tool impressions from the crime scene.`,
        rationale: 'References the physical evidence cards inspected in Phase 3.'
      },
      {
        id: 'def-timeline-rebuttal',
        tag: 'Timeline Integrity',
        categoryLabel: '⏱️ Timeline Rebuttal',
        text: `The incident timeline mathematically proves I could not have reached the crime scene in time. Check the official timeline records.`,
        rationale: 'Demonstrates geographical impossibility based on the timestamped timeline.'
      }
    ];
  };

  const getSuspicionOptions = () => [
    {
      id: 'susp-contra-evidence',
      tag: 'Evidence Conflict',
      label: 'Contradicts Physical Evidence',
      template: (target: string) => `I find ${target}'s statements directly inconsistent with the physical evidence logs.`
    },
    {
      id: 'susp-timeline-gap',
      tag: 'Timeline Gap',
      label: 'Unverified Timeline Window',
      template: (target: string) => `${target}'s alibi has an unverified gap during the critical incident timeframe.`
    },
    {
      id: 'susp-badge-log',
      tag: 'Access Logs',
      label: 'Access Badge Discrepancy',
      template: (target: string) => `${target}'s claimed location conflicts with the security access badge swipe records.`
    },
    {
      id: 'susp-evasive',
      tag: 'Interrogation',
      label: 'Evasive Deflection',
      template: (target: string) => `${target} is deflecting questions and offering contradictory alibis.`
    }
  ];

  // Skip/Advance button (for testing / prompt progression)
  const handleAdvanceManually = () => {
    sound.playActionSubmit();
    const advanced = gameEngine.advancePhase(room.id);
    if (advanced) setRoom({ ...advanced });
  };

  // Submit Investigation Action
  const handleSubmitAction = () => {
    let content = '';
    let emoji: string | undefined;

    const defenseOpts = getDefenseOptions();
    const suspicionOpts = getSuspicionOptions();

    if (selectedActionCategory === 'STATEMENT') {
      content = selectedStatementText || activeCase.allowedStatements[0].text;
    } else if (selectedActionCategory === 'QUESTION') {
      if (targetSeatIndex === null) {
        setActionSuccessMsg('Please select a target seat to question.');
        return;
      }
      content = selectedQuestionText || activeCase.predefinedQuestions[0].text;
    } else if (selectedActionCategory === 'SUSPICION') {
      if (targetSeatIndex === null) {
        setActionSuccessMsg('Please select a suspect seat to accuse.');
        return;
      }
      const targetAlias = room.seats[targetSeatIndex]?.alias || `Player ${targetSeatIndex + 1}`;
      const reasonObj = suspicionOpts.find((s) => s.id === selectedSuspicionReasonId) || suspicionOpts[0];
      content = reasonObj.template(targetAlias);
    } else if (selectedActionCategory === 'DEFENSE') {
      content = selectedDefenseText || (defenseOpts[0]?.text || `My alibi is verified by the official registry records. Check the timeline evidence.`);
    }

    const res = gameEngine.submitStructuredAction(room.id, uid, {
      actionType: selectedActionCategory,
      content,
      targetSeatIndex: targetSeatIndex ?? undefined,
      emoji
    });

    if (res.success) {
      sound.playActionSubmit();
      setActionSuccessMsg('Action submitted to public investigation log.');
      setTimeout(() => setActionSuccessMsg(''), 2500);
    }
  };

  const handleEmojiClick = (em: string) => {
    gameEngine.submitStructuredAction(room.id, uid, {
      actionType: 'EMOJI',
      content: 'Reaction',
      emoji: em
    });
    sound.playActionSubmit();
  };

  // Submit Special Action (Phase 5)
  const handleSubmitSpecialAction = () => {
    if (privateState.role === 'POLICE') {
      if (!specialActionEvidenceId) return;
      const res = gameEngine.submitSpecialAction(room.id, uid, {
        evidenceIdToInspect: specialActionEvidenceId
      });
      if (res.success) {
        sound.playActionSubmit();
        setSpecialActionSubmitted(true);
      }
    } else if (privateState.role === 'PROTECTOR') {
      if (specialActionProtectSeat === null) return;
      const res = gameEngine.submitSpecialAction(room.id, uid, {
        seatIndexToProtect: specialActionProtectSeat
      });
      if (res.success) {
        sound.playProtect();
        setSpecialActionSubmitted(true);
      }
    } else if (privateState.role === 'CHOR') {
      if (!specialActionDoubtText) return;
      const res = gameEngine.submitSpecialAction(room.id, uid, {
        doubtTextToPlant: specialActionDoubtText
      });
      if (res.success) {
        sound.playPlantDoubt();
        setSpecialActionSubmitted(true);
      }
    }
  };

  // Submit Final Vote (Phase 6)
  const handleCastVote = () => {
    if (selectedVoteSeatIndex === null) return;
    const res = gameEngine.submitFinalVote(room.id, uid, selectedVoteSeatIndex);
    if (res.success) {
      sound.playVoteCast();
      setHasVoted(true);
      setRoom({ ...room });
    }
  };

  // Rematch
  const handleRematch = () => {
    sound.playActionSubmit();
    const restarted = gameEngine.rematch(room.id);
    if (restarted) {
      setResultRecorded(false);
      setHasVoted(false);
      setSelectedVoteSeatIndex(null);
      setSpecialActionSubmitted(false);
      setRoom({ ...restarted });
    }
  };

  const shareText = `Chor Police: Bluff Royale match results for "${activeCase.title}". ${
    room.result?.winningTeam === 'POLICE_SIDE' ? 'Police caught the Chor!' : 'The Chor successfully escaped!'
  }`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Phase Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Case #{activeCase.id.replace('case_', '')}
            </span>
            <span className="text-xs text-slate-400">• {activeCase.location}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100">{activeCase.title}</h1>
        </div>

        {/* Phase Badge & Skip for convenience */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <PhaseTimer
              phaseEndsAt={room.phaseEndsAt}
              onTimerExpired={handleTimerExpired}
              label={
                room.currentPhase === 'CASE_INTRO'
                  ? 'Phase 1: Case Briefing'
                  : room.currentPhase === 'SECRET_ROLE'
                  ? 'Phase 2: Secret Role'
                  : room.currentPhase === 'EVIDENCE_REVIEW'
                  ? 'Phase 3: Evidence'
                  : room.currentPhase === 'INVESTIGATION'
                  ? 'Phase 4: Investigation'
                  : room.currentPhase === 'SPECIAL_ACTIONS'
                  ? 'Phase 5: Special Actions'
                  : room.currentPhase === 'FINAL_VOTING'
                  ? 'Phase 6: Final Voting'
                  : room.currentPhase === 'REVEAL'
                  ? 'Phase 7: The Reveal'
                  : 'Phase 8: Rematch'
              }
            />
          </div>

          {room.currentPhase !== 'REMATCH' && (
            <button
              onClick={handleAdvanceManually}
              title="Next Phase"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 6-Seat Table Overview */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Investigation Table (6 Seats)
          </span>
          <div className="flex items-center gap-2">
            <RoleBadge role={privateState.role} size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {room.seats.map((seat) => {
            const isSelectable =
              room.currentPhase === 'FINAL_VOTING' && seat.uid !== uid && !hasVoted;
            const isSelected = selectedVoteSeatIndex === seat.seatIndex;

            // Find recent statement for bubble
            const lastLog = [...room.actionLogs]
              .reverse()
              .find((l) => l.actorSeatIndex === seat.seatIndex);

            return (
              <SeatAvatar
                key={seat.seatIndex}
                seat={seat}
                isCurrentUser={seat.uid === uid}
                showRole={room.currentPhase === 'REVEAL' || room.currentPhase === 'REMATCH'}
                revealedRole={
                  room.result?.allRoles.find((r) => r.seatIndex === seat.seatIndex)?.role
                }
                votesCount={room.result?.voteSummary[seat.seatIndex]}
                isSelectableForVote={isSelectable}
                isSelectedForVote={isSelected}
                onSelectForVote={() => setSelectedVoteSeatIndex(seat.seatIndex)}
                recentActionText={lastLog?.content}
                recentActionType={lastLog?.actionType}
                recentEmoji={lastLog?.emoji}
              />
            );
          })}
        </div>
      </div>

      {/* PHASE 1: CASE INTRODUCTION */}
      {room.currentPhase === 'CASE_INTRO' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono text-amber-400">Incident Briefing</span>
              <h2 className="text-2xl font-black text-slate-100">{activeCase.title}</h2>
            </div>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
            {activeCase.summary || activeCase.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Location & Stakes</h3>
              <p className="text-sm font-semibold text-slate-200">{activeCase.location}</p>
              <p className="text-xs text-amber-400 mt-1">{activeCase.stakes || 'High stakes forensic deduction'}</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
              <h3 className="text-xs uppercase font-bold text-slate-400 mb-2">Incident Timeline</h3>
              <div className="space-y-1.5 text-xs text-slate-300">
                {(activeCase.timeline || [
                  { time: '14:00', event: 'Event opens to guests' },
                  { time: '14:15', event: 'Primary incident occurs' },
                  { time: '14:20', event: 'Alarm raised by staff' },
                  { time: '14:30', event: 'Area locked down for investigation' }
                ]).map((t, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="font-mono text-amber-400 font-bold">{t.time}</span>
                    <span>{t.event}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: SECRET ROLE & CLUE */}
      {room.currentPhase === 'SECRET_ROLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                Phase 2 Confidential Briefing
              </span>
              <h2 className="text-2xl font-black text-slate-100">
                Your Secret Identity & Clue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Assigned case: <span className="text-amber-400 font-semibold">{activeCase.title}</span>
              </p>
            </div>

            <button
              onClick={() => setHideRoleForPrivacy(!hideRoleForPrivacy)}
              className="self-start sm:self-center py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all"
            >
              {hideRoleForPrivacy ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Unhide Role</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-amber-400" />
                  <span>Privacy Hide</span>
                </>
              )}
            </button>
          </div>

          {hideRoleForPrivacy ? (
            /* Privacy Concealed State */
            <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-200">Role Dossier Concealed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hidden for in-person screen privacy. Click below to view your classified assignment.
                </p>
              </div>
              <button
                onClick={() => setHideRoleForPrivacy(false)}
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all"
              >
                Reveal My Assignment
              </button>
            </div>
          ) : (
            /* Direct, Crisp, High-Contrast Role Dossier (No 3D Flip, No Glass Glare) */
            <div className="space-y-6">
              {/* Primary Role Banner */}
              <div
                className={`p-5 sm:p-6 rounded-2xl border-2 shadow-lg transition-all ${
                  privateState.role === 'CHOR'
                    ? 'bg-red-950/60 border-red-500/80 text-red-100 shadow-red-950/60'
                    : privateState.role === 'POLICE'
                    ? 'bg-blue-950/60 border-blue-500/80 text-blue-100 shadow-blue-950/60'
                    : privateState.role === 'INFORMER'
                    ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 shadow-emerald-950/60'
                    : privateState.role === 'PROTECTOR'
                    ? 'bg-purple-950/60 border-purple-500/80 text-purple-100 shadow-purple-950/60'
                    : 'bg-slate-950 border-teal-500/80 text-teal-100 shadow-slate-950/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        privateState.role === 'CHOR'
                          ? 'bg-red-900/60 border-red-400 text-red-300'
                          : privateState.role === 'POLICE'
                          ? 'bg-blue-900/60 border-blue-400 text-blue-300'
                          : privateState.role === 'INFORMER'
                          ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300'
                          : privateState.role === 'PROTECTOR'
                          ? 'bg-purple-900/60 border-purple-400 text-purple-300'
                          : 'bg-teal-900/60 border-teal-400 text-teal-300'
                      }`}
                    >
                      {privateState.role === 'CHOR' && <Sparkles className="w-8 h-8" />}
                      {privateState.role === 'POLICE' && <Shield className="w-8 h-8" />}
                      {privateState.role === 'INFORMER' && <Eye className="w-8 h-8" />}
                      {privateState.role === 'PROTECTOR' && <Lock className="w-8 h-8" />}
                      {privateState.role === 'CITIZEN' && <Users className="w-8 h-8" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                          {privateState.role === 'CHOR'
                            ? 'The Thief'
                            : privateState.role === 'POLICE'
                            ? 'The Inspector'
                            : privateState.role === 'INFORMER'
                            ? 'The Eyewitness'
                            : privateState.role === 'PROTECTOR'
                            ? 'The Guardian'
                            : 'The Citizen'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-900/80 border border-slate-700 text-slate-200">
                          {privateState.role === 'CHOR'
                            ? 'Faction: Thief Syndicate'
                            : 'Faction: Investigation Bureau'}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
                        {privateState.role}
                      </h3>
                    </div>
                  </div>

                  <RoleBadge role={privateState.role} size="lg" />
                </div>
              </div>

              {/* 3 High-Contrast Information Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Secret Clue Panel */}
                <div className="bg-amber-950/30 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 space-y-2 shadow-md">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Search className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Confidential Case Clue
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-100 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
                    "{privateState.privateClue}"
                  </p>
                  <p className="text-[11px] text-amber-300/80 italic">
                    Only you know this specific intel. Use it strategically in Phase 4.
                  </p>
                </div>

                {/* 2. Victory Objective Panel */}
                <div className="bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 sm:p-5 space-y-2 shadow-md">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Target className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Victory Condition
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                    {privateState.objective}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {privateState.role === 'CHOR'
                      ? 'Avoid police arrest or trigger false suspect convictions.'
                      : 'Accumulate clues and vote correctly in Phase 6.'}
                  </p>
                </div>

                {/* 3. Special Phase 5 Power Panel */}
                <div className="bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 sm:p-5 space-y-2 shadow-md">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Zap className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Phase 5 Ability
                    </h4>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 space-y-1">
                    <span className="text-xs font-bold text-emerald-300 block">
                      {privateState.specialActionName}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {privateState.specialActionDescription}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Unlocks automatically when the match enters Phase 5.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: EVIDENCE REVIEW */}
      {room.currentPhase === 'EVIDENCE_REVIEW' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-mono text-amber-400">Forensic Records</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                4 Public Evidence Items
              </h2>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Click any evidence card to examine details
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCase.publicEvidence.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidence(ev)}
                className="bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                    {ev.tag}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-2">{ev.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mt-1">{ev.description}</p>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 font-semibold">
                  <Search className="w-3.5 h-3.5" />
                  <span>Inspect Card</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 4: STRUCTURED INVESTIGATION */}
      {room.currentPhase === 'INVESTIGATION' && (() => {
        const defenseOptions = getDefenseOptions();
        const suspicionOptions = getSuspicionOptions();
        const currentDefenseText = selectedDefenseText || defenseOptions[0]?.text || '';
        
        const defenseLogs = room.actionLogs.filter((l) => l.actionType === 'DEFENSE');
        const suspicionLogs = room.actionLogs.filter((l) => l.actionType === 'SUSPICION');
        const questionLogs = room.actionLogs.filter((l) => l.actionType === 'QUESTION');
        const statementLogs = room.actionLogs.filter((l) => l.actionType === 'STATEMENT');

        const displayedLogs =
          logFilter === 'DEFENSE'
            ? defenseLogs
            : logFilter === 'SUSPICION'
            ? suspicionLogs
            : logFilter === 'QUESTION'
            ? questionLogs
            : logFilter === 'STATEMENT'
            ? statementLogs
            : room.actionLogs;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Action Selector Form */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
              <div>
                <span className="text-xs uppercase font-mono text-amber-400">Phase 4 Investigation</span>
                <h2 className="text-xl font-black text-slate-100">Speak, Defend & Question Suspects</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish high-contrast alibi statements, interrogate suspects, or review verified timeline logs.
                </p>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'DEFENSE', label: '🛡️ Defend Alibi' },
                    { id: 'STATEMENT', label: '📄 Alibi Statement' },
                    { id: 'QUESTION', label: '❓ Ask Question' },
                    { id: 'SUSPICION', label: '🚨 Cast Suspicion' }
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedActionCategory(cat.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                      selectedActionCategory === cat.id
                        ? cat.id === 'DEFENSE'
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50'
                          : cat.id === 'SUSPICION'
                          ? 'bg-red-500 text-slate-950 shadow-lg shadow-red-950/50'
                          : 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-950/50'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* DEFENSE STATEMENT SELECTOR (HIGH READABILITY) */}
              {selectedActionCategory === 'DEFENSE' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-200">
                      Choose Your Alibi Defense Statement:
                    </label>
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> High Legibility
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Publish an alibi defense to the match log to substantiate your whereabouts, counter accusations, and convince other investigators.
                  </p>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {defenseOptions.map((opt) => {
                      const isSelected = (selectedDefenseText || defenseOptions[0]?.text) === opt.text;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedDefenseText(opt.text)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-950/50 border-2 border-emerald-400 text-emerald-100 ring-2 ring-emerald-500/30 shadow-lg'
                              : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500/50 hover:bg-slate-950/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                isSelected
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {opt.categoryLabel}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-100">
                            "{opt.text}"
                          </p>

                          <p className="text-[11px] text-slate-400 mt-1.5 italic">
                            Strategy: {opt.rationale}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Defense Preview Box */}
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> Defense Broadcast Preview
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Visible to all 6 players</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 font-medium italic bg-slate-950/90 p-2.5 rounded-xl border border-emerald-500/30">
                      "{currentDefenseText}"
                    </p>
                  </div>
                </div>
              )}

              {/* Target Seat Selector (for questions and suspicion) */}
              {(selectedActionCategory === 'QUESTION' || selectedActionCategory === 'SUSPICION') && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target Suspect:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {room.seats
                      .filter((s) => s.uid !== uid)
                      .map((s) => (
                        <button
                          key={s.seatIndex}
                          onClick={() => setTargetSeatIndex(s.seatIndex)}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold truncate border transition-all ${
                            targetSeatIndex === s.seatIndex
                              ? selectedActionCategory === 'SUSPICION'
                                ? 'bg-red-600 text-white border-red-400 shadow'
                                : 'bg-indigo-600 text-white border-indigo-400 shadow'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {s.alias}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Suspicion Reason Picker */}
              {selectedActionCategory === 'SUSPICION' && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Select Suspicion Reason:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suspicionOptions.map((opt) => {
                      const isSelected = selectedSuspicionReasonId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedSuspicionReasonId(opt.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-red-950/50 border-2 border-red-400 text-red-100 ring-2 ring-red-500/30'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-red-500/50'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-1">
                            [{opt.tag}]
                          </span>
                          <p className="text-xs font-medium text-slate-100">{opt.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Suspicion Preview Box */}
                  {targetSeatIndex !== null && (
                    <div className="bg-red-950/30 border border-red-500/40 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[11px] text-red-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Accusation Preview
                      </span>
                      <p className="text-xs text-slate-100 italic bg-slate-950/90 p-2.5 rounded-xl border border-red-500/30">
                        "{suspicionOptions.find((o) => o.id === selectedSuspicionReasonId)?.template(
                          room.seats[targetSeatIndex]?.alias || `Player ${targetSeatIndex + 1}`
                        )}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Predefined Statement Picker */}
              {selectedActionCategory === 'STATEMENT' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Select Case Alibi Statement:
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeCase.allowedStatements.map((stmt) => (
                      <div
                        key={stmt.id}
                        onClick={() => setSelectedStatementText(stmt.text)}
                        className={`p-3 rounded-xl text-xs border cursor-pointer transition-all ${
                          selectedStatementText === stmt.text
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-2 ring-amber-400/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-amber-400 uppercase">
                            [{stmt.roleTypeHint} Statement]
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-100">"{stmt.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predefined Question Picker */}
              {selectedActionCategory === 'QUESTION' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Select Question to Ask:
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {activeCase.predefinedQuestions.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQuestionText(q.text)}
                        className={`p-3 rounded-xl text-xs border cursor-pointer transition-all ${
                          selectedQuestionText === q.text
                            ? 'bg-indigo-950/40 border-indigo-400 text-indigo-200 ring-2 ring-indigo-400/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-bold uppercase text-[10px] text-indigo-400 mr-2">
                          [{q.category}]
                        </span>
                        <span className="text-xs font-medium text-slate-100">"{q.text}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Reactions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Quick Emoji Reactions:</label>
                <div className="flex gap-2">
                  {['🤔', '🧐', '🚨', '🤫', '⚖️', '🛡️'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              <button
                onClick={handleSubmitAction}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  selectedActionCategory === 'DEFENSE'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                    : selectedActionCategory === 'SUSPICION'
                    ? 'bg-red-500 hover:bg-red-400 text-slate-950 shadow-red-950/50'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                }`}
              >
                {selectedActionCategory === 'DEFENSE' ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Publish Defense Statement to Match Log
                  </>
                ) : selectedActionCategory === 'SUSPICION' ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Publish Accusation to Match Log
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    Publish Action to Match Log
                  </>
                )}
              </button>
            </div>

            {/* Right: Live Investigation Action Logs with Readable Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl h-[560px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-slate-100">Live Action Stream</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {room.actionLogs.length} events
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-800 pb-2.5 overflow-x-auto">
                  {(
                    [
                      { id: 'ALL', label: `All (${room.actionLogs.length})` },
                      { id: 'DEFENSE', label: `🛡️ Defenses (${defenseLogs.length})` },
                      { id: 'SUSPICION', label: `🚨 Accuse (${suspicionLogs.length})` },
                      { id: 'QUESTION', label: `❓ Questions (${questionLogs.length})` },
                      { id: 'STATEMENT', label: `📄 Alibis (${statementLogs.length})` }
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setLogFilter(f.id)}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                        logFilter === f.id
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Logs Stream */}
                <div className="space-y-3 overflow-y-auto max-h-[430px] pr-1">
                  {displayedLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No {logFilter.toLowerCase()} statements logged yet.
                    </div>
                  ) : (
                    displayedLogs.map((log) => {
                      const isDefense = log.actionType === 'DEFENSE';
                      const isSuspicion = log.actionType === 'SUSPICION';
                      const isQuestion = log.actionType === 'QUESTION';
                      const isCurrentUser = log.actorSeatIndex === currentUserSeat?.seatIndex;

                      return (
                        <div
                          key={log.id}
                          className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 transition-all ${
                            isDefense
                              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                              : isSuspicion
                              ? 'bg-red-950/40 border-red-500/50 shadow-md shadow-red-950/30'
                              : isQuestion
                              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/30'
                              : isCurrentUser
                              ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
                              : 'bg-slate-950 border-slate-800/80 text-slate-300'
                          }`}
                        >
                          {/* Log Header */}
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold uppercase text-[9px] px-1.5 py-0.5 rounded font-mono ${
                                  isDefense
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : isSuspicion
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    : isQuestion
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {isDefense
                                  ? '🛡️ Alibi Defense'
                                  : isSuspicion
                                  ? '🚨 Accusation'
                                  : isQuestion
                                  ? '❓ Question'
                                  : '📄 Statement'}
                              </span>

                              <span className="font-bold text-slate-100">
                                {log.actorAlias}
                                {log.targetAlias && (
                                  <span className="text-slate-400 font-normal">
                                    {' '}
                                    → <strong className="text-amber-300">{log.targetAlias}</strong>
                                  </span>
                                )}
                              </span>
                            </div>

                            <span className="text-[10px] text-slate-500 font-mono">
                              Seat {log.actorSeatIndex + 1}
                            </span>
                          </div>

                          {/* Log Content - Distinct High-Contrast Box */}
                          <div
                            className={`p-2.5 rounded-xl border text-xs sm:text-sm font-medium leading-relaxed ${
                              isDefense
                                ? 'bg-slate-950 border-l-4 border-l-emerald-400 border-slate-800 text-slate-100 shadow-inner'
                                : isSuspicion
                                ? 'bg-slate-950 border-l-4 border-l-red-400 border-slate-800 text-slate-100'
                                : isQuestion
                                ? 'bg-slate-950 border-l-4 border-l-indigo-400 border-slate-800 text-slate-100'
                                : 'bg-slate-950 border-l-4 border-l-amber-400 border-slate-800 text-slate-100'
                            }`}
                          >
                            <p>
                              {log.emoji && <span className="mr-1.5 text-base">{log.emoji}</span>}
                              "{log.content}"
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PHASE 5: SPECIAL ACTIONS */}
      {room.currentPhase === 'SPECIAL_ACTIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase font-mono text-amber-400">Phase 5 Special Powers</span>
            <h2 className="text-2xl font-black text-slate-100">
              {privateState.specialActionName}
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              {privateState.specialActionDescription}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* POLICE SPECIAL ACTION */}
            {privateState.role === 'POLICE' && (
              <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold text-slate-200">
                  Select Evidence Item to Inspect:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeCase.publicEvidence.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => setSpecialActionEvidenceId(ev.id)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        specialActionEvidenceId === ev.id
                          ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-100">{ev.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{ev.tag} evidence</div>
                    </button>
                  ))}
                </div>

                {privateState.specialActionFeedback && (
                  <div className="p-3 bg-blue-950/50 border border-blue-500/40 rounded-xl text-blue-200 text-xs">
                    {privateState.specialActionFeedback}
                  </div>
                )}

                <button
                  onClick={handleSubmitSpecialAction}
                  disabled={specialActionSubmitted || !specialActionEvidenceId}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-950"
                >
                  <Search className="w-4 h-4" />
                  {specialActionSubmitted ? 'Evidence Inspected' : 'Inspect Evidence Forensics'}
                </button>
              </div>
            )}

            {/* PROTECTOR SPECIAL ACTION */}
            {privateState.role === 'PROTECTOR' && (
              <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold text-slate-200">
                  Select Player to Shield From Elimination:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.seats
                    .filter((s) => s.uid !== uid)
                    .map((s) => (
                      <button
                        key={s.seatIndex}
                        onClick={() => setSpecialActionProtectSeat(s.seatIndex)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                          specialActionProtectSeat === s.seatIndex
                            ? 'bg-purple-950/60 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {s.alias}
                      </button>
                    ))}
                </div>

                {privateState.specialActionFeedback && (
                  <div className="p-3 bg-purple-950/50 border border-purple-500/40 rounded-xl text-purple-200 text-xs">
                    {privateState.specialActionFeedback}
                  </div>
                )}

                <button
                  onClick={handleSubmitSpecialAction}
                  disabled={specialActionSubmitted || specialActionProtectSeat === null}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950"
                >
                  <Lock className="w-4 h-4" />
                  {specialActionSubmitted ? 'Shield Activated' : 'Activate Guardian Shield'}
                </button>
              </div>
            )}

            {/* CHOR SPECIAL ACTION */}
            {privateState.role === 'CHOR' && (
              <div className="space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold text-slate-200">
                  Select Ambiguous Clue to Plant in Public Log:
                </label>
                <div className="space-y-2">
                  {activeCase.plantDoubtOptions.map((doubt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSpecialActionDoubtText(doubt.text)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                        specialActionDoubtText === doubt.text
                          ? 'bg-red-950/60 border-red-500 text-red-200 ring-1 ring-red-500'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      "{doubt.text}"
                    </button>
                  ))}
                </div>

                {privateState.specialActionFeedback && (
                  <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-200 text-xs">
                    {privateState.specialActionFeedback}
                  </div>
                )}

                <button
                  onClick={handleSubmitSpecialAction}
                  disabled={specialActionSubmitted || !specialActionDoubtText}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950"
                >
                  <Sparkles className="w-4 h-4" />
                  {specialActionSubmitted ? 'Doubt Planted' : 'Plant Doubt in Public Record'}
                </button>
              </div>
            )}

            {/* CITIZEN & INFORMER */}
            {(privateState.role === 'CITIZEN' || privateState.role === 'INFORMER') && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-2">
                <Users className="w-8 h-8 text-teal-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-100">Reviewing Forensic Clues</h3>
                <p className="text-xs text-slate-400">
                  Observe the other seats as special powers take effect before the final vote begins.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 6: FINAL VOTING */}
      {room.currentPhase === 'FINAL_VOTING' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center animate-fade-in">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-red-400">Phase 6 Final Accusation</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              Cast Your Final Vote for the Chor
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Select the seat you believe is the mastermind Chor. You cannot vote for yourself.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-3">
            {selectedVoteSeatIndex !== null && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-200 text-xs">
                Selected suspect:{' '}
                <span className="font-bold text-amber-400">
                  {room.seats[selectedVoteSeatIndex]?.alias}
                </span>{' '}
                (Seat {selectedVoteSeatIndex + 1})
              </div>
            )}

            <button
              onClick={handleCastVote}
              disabled={hasVoted || selectedVoteSeatIndex === null}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition-all"
            >
              <Shield className="w-5 h-5" />
              {hasVoted ? 'Vote Submitted' : 'Lock In Final Accusation'}
            </button>
          </div>
        </div>
      )}

      {/* PHASE 7 & 8: REVEAL & REMATCH */}
      {(room.currentPhase === 'REVEAL' || room.currentPhase === 'REMATCH') && room.result && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          {/* Victory / Defeat Banner */}
          <div
            className={`p-6 rounded-2xl border text-center space-y-2 ${
              room.result.winningTeam === 'POLICE_SIDE'
                ? 'bg-blue-950/50 border-blue-500/60 shadow-blue-950/50'
                : 'bg-red-950/50 border-red-500/60 shadow-red-950/50'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {room.result.winningTeam === 'POLICE_SIDE'
                  ? 'Police Team Victory'
                  : 'Chor Mastermind Victory'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">
              The Chor Was: <span className="text-amber-400">{room.result.chorAlias}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              {room.result.correctReasoning}
            </p>
          </div>

          {/* Scores & Roles Breakdown Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
            <h3 className="text-xs font-bold uppercase text-slate-400 mb-3">
              Match Scores & Role Roster
            </h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2">Seat</th>
                  <th className="pb-2">Alias</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Votes Received</th>
                  <th className="pb-2 text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {room.result.allRoles.map((r) => (
                  <tr key={r.seatIndex} className={r.seatIndex === currentUserSeat?.seatIndex ? 'bg-slate-900/60 font-bold' : ''}>
                    <td className="py-2.5 font-mono text-slate-400">Seat {r.seatIndex + 1}</td>
                    <td className="py-2.5 text-slate-100">
                      {r.alias} {r.isBot && <span className="text-[10px] text-amber-400 font-bold ml-1">(BOT)</span>}
                    </td>
                    <td className="py-2.5">
                      <RoleBadge role={r.role} size="sm" />
                    </td>
                    <td className="py-2.5">{r.votesReceived}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-amber-400">
                      +{r.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <HomeIcon className="w-4 h-4" />
              Return Home
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShareModalOpen(true)}
                className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share Result
              </button>

              <button
                onClick={handleRematch}
                className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Play Rematch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Viewer Modal */}
      <EvidenceViewerModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

      {/* Share Match Result Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Match Result"
        shareText={shareText}
        shareUrl={shareUrl}
      />
    </div>
  );
};
