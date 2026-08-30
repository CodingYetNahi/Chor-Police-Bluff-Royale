import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { sound } from '../services/soundService';

interface PhaseTimerProps {
  phaseEndsAt: number;
  totalDurationMs?: number;
  onTimerExpired?: () => void;
  label?: string;
}

export const PhaseTimer: React.FC<PhaseTimerProps> = ({
  phaseEndsAt,
  totalDurationMs = 15000,
  onTimerExpired,
  label
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => Math.max(0, phaseEndsAt - Date.now()));

  useEffect(() => {
    let lastSecond = Math.ceil(Math.max(0, phaseEndsAt - Date.now()) / 1000);

    const interval = setInterval(() => {
      const remaining = Math.max(0, phaseEndsAt - Date.now());
      setTimeLeftMs(remaining);

      const currentSecond = Math.ceil(remaining / 1000);
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond;
        if (currentSecond <= 5 && currentSecond > 0) {
          sound.playTimerTick();
        }
      }

      if (remaining <= 0) {
        clearInterval(interval);
        if (onTimerExpired) onTimerExpired();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [phaseEndsAt, onTimerExpired]);

  const secondsLeft = Math.ceil(timeLeftMs / 1000);
  const percentage = Math.min(100, Math.max(0, (timeLeftMs / totalDurationMs) * 100));

  const isUrgent = secondsLeft <= 5;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur">
      <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
          <span>{label || 'Time Remaining'}</span>
        </div>
        <span
          className={`font-mono font-bold px-2 py-0.5 rounded ${
            isUrgent ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-200'
          }`}
        >
          {secondsLeft}s
        </span>
      </div>

      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isUrgent ? 'bg-red-500' : percentage < 40 ? 'bg-amber-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
