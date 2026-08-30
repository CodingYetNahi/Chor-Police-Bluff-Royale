import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PlayerStats, Role, UserSettings } from '../../types';
import { generateRandomAlias, validateAlias } from '../../utils/filter';
import { sound } from '../../services/soundService';

interface AuthContextType {
  uid: string;
  alias: string;
  isAnonymous: boolean;
  stats: PlayerStats;
  settings: UserSettings;
  rerollAlias: () => void;
  updateAlias: (newAlias: string) => { success: boolean; error?: string };
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  recordMatchResult: (matchData: {
    matchId: string;
    caseTitle: string;
    role: Role;
    result: 'WIN' | 'LOSS';
    points: number;
    didAccuseChor?: boolean;
    didEscapeAsChor?: boolean;
  }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const UID_STORAGE_KEY = 'cp_player_uid';
const ALIAS_STORAGE_KEY = 'cp_player_alias';
const STATS_STORAGE_KEY = 'cp_player_stats';

function calculateRankTier(score: number): string {
  if (score >= 2000) return 'Chief Inspector';
  if (score >= 1200) return 'Senior Detective';
  if (score >= 600) return 'Junior Sleuth';
  if (score >= 200) return 'Rookie Investigator';
  return 'Trainee Observer';
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uid, setUid] = useState<string>('');
  const [alias, setAlias] = useState<string>('Silent Tiger');
  const [settings, setSettingsState] = useState<UserSettings>(() => sound.getSettings());
  const [stats, setStats] = useState<PlayerStats>({
    matchesPlayed: 0,
    wins: 0,
    correctAccusations: 0,
    chorEscapes: 0,
    bestRole: 'POLICE',
    currentScore: 0,
    rankTier: 'Trainee Observer',
    recentMatches: []
  });

  useEffect(() => {
    // 1. Initialize or restore persistent UID
    let storedUid = localStorage.getItem(UID_STORAGE_KEY);
    if (!storedUid) {
      storedUid = `cp_anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(UID_STORAGE_KEY, storedUid);
    }
    setUid(storedUid);

    // 2. Initialize or restore Alias
    let storedAlias = localStorage.getItem(ALIAS_STORAGE_KEY);
    if (!storedAlias) {
      storedAlias = generateRandomAlias();
      localStorage.setItem(ALIAS_STORAGE_KEY, storedAlias);
    }
    setAlias(storedAlias);

    // 3. Initialize or restore Lifetime Statistics
    try {
      const storedStats = localStorage.getItem(STATS_STORAGE_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch {
      // ignore
    }
  }, []);

  const rerollAlias = () => {
    const fresh = generateRandomAlias();
    setAlias(fresh);
    localStorage.setItem(ALIAS_STORAGE_KEY, fresh);
    sound.saveSettings({ alias: fresh });
  };

  const updateAlias = (newAlias: string): { success: boolean; error?: string } => {
    const validation = validateAlias(newAlias);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    const clean = validation.sanitized!;
    setAlias(clean);
    localStorage.setItem(ALIAS_STORAGE_KEY, clean);
    sound.saveSettings({ alias: clean });
    return { success: true };
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const saved = sound.saveSettings(newSettings);
    setSettingsState(saved);
  };

  const recordMatchResult = (matchData: {
    matchId: string;
    caseTitle: string;
    role: Role;
    result: 'WIN' | 'LOSS';
    points: number;
    didAccuseChor?: boolean;
    didEscapeAsChor?: boolean;
  }) => {
    setStats((prev) => {
      const newPlayed = prev.matchesPlayed + 1;
      const newWins = prev.wins + (matchData.result === 'WIN' ? 1 : 0);
      const newAccusations = prev.correctAccusations + (matchData.didAccuseChor ? 1 : 0);
      const newEscapes = prev.chorEscapes + (matchData.didEscapeAsChor ? 1 : 0);
      const newScore = Math.max(0, prev.currentScore + matchData.points);
      const newTier = calculateRankTier(newScore);

      const newRecent = [
        {
          matchId: matchData.matchId,
          caseTitle: matchData.caseTitle,
          role: matchData.role,
          result: matchData.result,
          points: matchData.points,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        },
        ...prev.recentMatches
      ].slice(0, 5);

      const updated: PlayerStats = {
        matchesPlayed: newPlayed,
        wins: newWins,
        correctAccusations: newAccusations,
        chorEscapes: newEscapes,
        bestRole: matchData.result === 'WIN' ? matchData.role : prev.bestRole,
        currentScore: newScore,
        rankTier: newTier,
        recentMatches: newRecent
      };

      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        uid,
        alias,
        isAnonymous: true,
        stats,
        settings,
        rerollAlias,
        updateAlias,
        updateSettings,
        recordMatchResult
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
