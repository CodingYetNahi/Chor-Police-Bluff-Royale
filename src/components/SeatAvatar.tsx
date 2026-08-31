import React, { useState } from 'react';
import { Role, Seat, StructuredActionType } from '../types';
import { RoleBadge } from './RoleBadge';
import {
  Bot,
  Shield,
  CheckCircle2,
  User,
  WifiOff,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  X,
} from 'lucide-react';

interface SeatAvatarProps {
  seat: Seat;
  isCurrentUser: boolean;
  revealedRole?: Role;
  showRole?: boolean;
  isSelectedForVote?: boolean;
  isSelectableForVote?: boolean;
  onSelectForVote?: () => void;
  recentActionText?: string;
  recentActionType?: StructuredActionType;
  recentEmoji?: string;
  votesCount?: number;
}

export const SeatAvatar: React.FC<SeatAvatarProps> = ({
  seat,
  isCurrentUser,
  revealedRole,
  showRole = false,
  isSelectedForVote = false,
  isSelectableForVote = false,
  onSelectForVote,
  recentActionText,
  recentActionType,
  recentEmoji,
  votesCount,
}) => {
  const [showFullPopup, setShowFullPopup] = useState(false);

  const getActionBadgeStyle = () => {
    switch (recentActionType) {
      case 'DEFENSE':
        return {
          bg: 'bg-emerald-950 border-emerald-400 text-emerald-100 shadow-emerald-950/80',
          icon: <Shield className="w-3 h-3 text-emerald-400 flex-shrink-0" />,
          label: 'Alibi Defense',
        };
      case 'SUSPICION':
        return {
          bg: 'bg-red-950 border-red-400 text-red-100 shadow-red-950/80',
          icon: <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />,
          label: 'Accusation',
        };
      case 'QUESTION':
        return {
          bg: 'bg-indigo-950 border-indigo-400 text-indigo-100 shadow-indigo-950/80',
          icon: <HelpCircle className="w-3 h-3 text-indigo-400 flex-shrink-0" />,
          label: 'Question',
        };
      case 'STATEMENT':
      default:
        return {
          bg: 'bg-slate-900 border-amber-400 text-slate-100 shadow-slate-950/80',
          icon: <MessageSquare className="w-3 h-3 text-amber-400 flex-shrink-0" />,
          label: 'Statement',
        };
    }
  };

  const actionStyle = getActionBadgeStyle();

  return (
    <div
      onClick={isSelectableForVote ? onSelectForVote : undefined}
      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center min-w-[120px] sm:min-w-[140px] ${
        isSelectableForVote
          ? 'cursor-pointer hover:border-amber-400 hover:scale-[1.02] active:scale-[0.98]'
          : ''
      } ${
        isSelectedForVote
          ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-950/50'
          : isCurrentUser
            ? 'bg-indigo-950/30 border-indigo-500/40'
            : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      {/* Speech / Reaction Bubble */}
      {(recentActionText || recentEmoji) && (
        <>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowFullPopup(!showFullPopup);
            }}
            title="Click to inspect full statement"
            className={`absolute -top-8 z-20 max-w-[180px] sm:max-w-[210px] cursor-pointer text-left px-2.5 py-1 rounded-xl border-2 shadow-xl transition-all hover:scale-105 ${actionStyle.bg}`}
          >
            <div className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider mb-0.5 opacity-90">
              {actionStyle.icon}
              <span className="truncate">{actionStyle.label}</span>
            </div>

            <p className="text-[11px] font-semibold leading-tight line-clamp-2">
              {recentEmoji && <span className="mr-1">{recentEmoji}</span>}
              {recentActionText}
            </p>
          </div>

          {/* Full Popover on Click for Complete Readability */}
          {showFullPopup && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute -top-28 left-1/2 -translate-x-1/2 z-50 w-64 bg-slate-900 border-2 border-amber-400 rounded-2xl p-3.5 shadow-2xl text-left space-y-1.5 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[10px]">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  {actionStyle.icon}
                  {seat.alias} ({actionStyle.label})
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullPopup(false)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-100 font-medium leading-relaxed">
                {recentEmoji && <span className="mr-1.5 text-sm">{recentEmoji}</span>}"{recentActionText}"
              </p>
            </div>
          )}
        </>
      )}

      {/* Top Indicators */}
      <div className="w-full flex items-center justify-between gap-1 mb-1">
        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
          Seat {seat.seatIndex + 1}
        </span>

        <div className="flex items-center gap-1">
          {seat.isBot && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30">
              <Bot className="w-3 h-3" />
              BOT
            </span>
          )}
          {seat.isProtected && (
            <span className="inline-flex items-center text-[10px] font-bold p-0.5 rounded-full bg-purple-900 text-purple-300 border border-purple-500">
              <Shield className="w-3 h-3" />
            </span>
          )}
          {!seat.connected && (
            <span title="Disconnected" className="text-red-400">
              <WifiOff className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Avatar Icon */}
      <div className="relative my-1">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-base sm:text-lg border-2 shadow-inner ${
            isCurrentUser
              ? 'bg-indigo-900/60 border-indigo-400 text-indigo-200'
              : seat.isBot
                ? 'bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-slate-800/80 border-slate-600 text-slate-100'
          }`}
        >
          {seat.isBot ? (
            <Bot className="w-6 h-6 text-amber-400" />
          ) : (
            <User className="w-6 h-6 text-slate-300" />
          )}
        </div>

        {seat.isReady && (
          <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Alias */}
      <div className="w-full mt-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate max-w-[130px]">{seat.alias}</p>
        {isCurrentUser && <p className="text-[10px] text-indigo-400 font-medium">(You)</p>}
      </div>

      {/* Role Badge if revealed */}
      {showRole && revealedRole && (
        <div className="mt-2">
          <RoleBadge role={revealedRole} size="sm" />
        </div>
      )}

      {/* Votes Count Badge if available */}
      {votesCount !== undefined && votesCount > 0 && (
        <div className="mt-2 text-xs font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-500/40">
          {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
        </div>
      )}

      {/* Vote Selector Button */}
      {isSelectableForVote && (
        <button
          type="button"
          className={`mt-2 w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            isSelectedForVote
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          {isSelectedForVote ? 'Selected Suspect' : 'Vote Suspect'}
        </button>
      )}
    </div>
  );
};
