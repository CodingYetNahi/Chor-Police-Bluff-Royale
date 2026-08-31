import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { PlayerStats, Role, UserSettings } from '../../types';
import { generateRandomAlias, validateAlias } from '../../utils/filter';
import { sound } from '../../services/soundService';
import { auth, authPersistenceReady, db, functions } from '../../services/firebase';

interface AuthContextType {
  uid: string;
  alias: string;
  isAnonymous: boolean;
  loading: boolean;
  error: string | null;
  stats: PlayerStats;
  settings: UserSettings;
  isAdmin: boolean;
  rerollAlias: () => void;
  updateAlias: (value: string) => { success: boolean; error?: string };
  updateSettings: (settings: Partial<UserSettings>) => void;
  recordMatchResult: (data: {
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
const emptyStats: PlayerStats = {
  matchesPlayed: 0,
  wins: 0,
  correctAccusations: 0,
  chorEscapes: 0,
  bestRole: 'POLICE',
  currentScore: 0,
  rankTier: 'Trainee Observer',
  recentMatches: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setAdmin] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [alias, setAlias] = useState(() => localStorage.getItem('cp_player_alias') || generateRandomAlias());
  const [settings, setSettings] = useState<UserSettings>(() => sound.getSettings());
  useEffect(() => {
    localStorage.setItem('cp_player_alias', alias);
    let unsubscribeProfile = () => {};
    authPersistenceReady
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          try {
            const account = user ?? (await signInAnonymously(auth)).user;
            setUid(account.uid);
            setAdmin((await account.getIdTokenResult()).claims.admin === true);
            await httpsCallable(functions, 'initializePlayer')({ alias });
            unsubscribeProfile();
            unsubscribeProfile = onSnapshot(doc(db, 'players', account.uid), (snap) => {
              const remote = snap.data()?.stats as Partial<PlayerStats> | undefined;
              if (remote) setStats({ ...emptyStats, ...remote });
            });
            setLoading(false);
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Anonymous authentication failed.');
            setLoading(false);
          }
        });
        return unsubscribe;
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Authentication persistence failed.');
        setLoading(false);
      });
    return () => unsubscribeProfile();
  }, []);
  const updateAlias = (value: string) => {
    const valid = validateAlias(value);
    if (!valid.isValid) return { success: false, error: valid.error };
    const clean = valid.sanitized!;
    setAlias(clean);
    localStorage.setItem('cp_player_alias', clean);
    void httpsCallable(functions, 'initializePlayer')({ alias: clean });
    return { success: true };
  };
  const rerollAlias = () => {
    updateAlias(generateRandomAlias());
  };
  const updateSettings = (value: Partial<UserSettings>) => setSettings(sound.saveSettings(value));
  const recordMatchResult = () => {
    /* Statistics are written only by match resolution on the server. */
  };
  return (
    <AuthContext.Provider
      value={{
        uid,
        alias,
        isAnonymous: true,
        loading,
        error,
        stats,
        settings,
        isAdmin,
        rerollAlias,
        updateAlias,
        updateSettings,
        recordMatchResult,
      }}
    >
      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="min-h-screen grid place-items-center bg-slate-950 text-amber-400"
        >
          Securing your anonymous session…
        </div>
      ) : error ? (
        <div role="alert" className="min-h-screen grid place-items-center bg-slate-950 text-red-300">
          <div>
            <h1 className="text-xl font-bold">Unable to sign in</h1>
            <p>{error}</p>
            <button className="mt-4 underline" onClick={() => location.reload()}>
              Try again
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
