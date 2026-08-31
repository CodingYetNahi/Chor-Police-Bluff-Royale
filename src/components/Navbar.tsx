import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { sound } from '../services/soundService';
import {
  Shield,
  Volume2,
  VolumeX,
  Vibrate,
  SmartphoneNfc,
  RefreshCw,
  Edit2,
  BookOpen,
  Trophy,
  Settings as SettingsIcon,
  FileQuestion,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { alias, rerollAlias, updateAlias, uid, settings, updateSettings, stats } = useAuth();
  const location = useLocation();
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [newAliasInput, setNewAliasInput] = useState(alias);
  const [aliasError, setAliasError] = useState('');

  const toggleSound = () => {
    const newVal = !settings.masterSound;
    updateSettings({ masterSound: newVal });
    if (newVal) sound.playActionSubmit();
  };

  const toggleVibration = () => {
    const newVal = !settings.vibrationEnabled;
    updateSettings({ vibrationEnabled: newVal });
    if (newVal) sound.triggerHaptic(50);
  };

  const handleSaveAlias = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateAlias(newAliasInput);
    if (res.success) {
      setIsEditingAlias(false);
      setAliasError('');
      sound.playActionSubmit();
    } else {
      setAliasError(res.error || 'Invalid alias');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-950/50 group-hover:scale-105 transition-all">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-100 group-hover:text-amber-400 transition-colors">
                Chor Police
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Royale
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Social Deduction</p>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              location.pathname === '/'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            Play Match
          </Link>
          <Link
            to="/how-to-play"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              location.pathname === '/how-to-play'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Rules & Roles
          </Link>
          <Link
            to="/cases"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              location.pathname === '/cases'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileQuestion className="w-3.5 h-3.5" />
            Cases Archive
          </Link>
          <Link
            to="/stats"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              location.pathname === '/stats'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Records
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Alias Chip */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200">
            <span className="font-semibold text-slate-100 max-w-[90px] sm:max-w-[120px] truncate">
              {alias}
            </span>
            <button
              onClick={() => {
                setNewAliasInput(alias);
                setIsEditingAlias(true);
              }}
              title="Edit Alias"
              className="ml-1.5 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                rerollAlias();
                sound.playActionSubmit();
              }}
              title="Reroll Safe Alias"
              className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-all"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            title={settings.masterSound ? 'Sound Muted' : 'Sound Enabled'}
            className={`p-2 rounded-xl border transition-all ${
              settings.masterSound
                ? 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
                : 'bg-red-950/40 text-red-400 border-red-500/30'
            }`}
          >
            {settings.masterSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptics Toggle */}
          <button
            onClick={toggleVibration}
            title={settings.vibrationEnabled ? 'Vibration On' : 'Vibration Off'}
            className={`p-2 rounded-xl border transition-all ${
              settings.vibrationEnabled
                ? 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
                : 'bg-slate-900/50 text-slate-500 border-slate-800'
            }`}
          >
            {settings.vibrationEnabled ? (
              <Vibrate className="w-4 h-4 text-amber-400" />
            ) : (
              <SmartphoneNfc className="w-4 h-4" />
            )}
          </button>

          <Link
            to="/settings"
            title="Settings"
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Edit Alias Modal */}
      {isEditingAlias && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">Update Display Alias</h3>
            <p className="text-xs text-slate-400 mb-4">
              3 to 16 characters. Letters, numbers, and spaces only.
            </p>

            <form onSubmit={handleSaveAlias} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={newAliasInput}
                  onChange={(e) => setNewAliasInput(e.target.value)}
                  maxLength={16}
                  placeholder="e.g. Clever Falcon"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                {aliasError && <p className="text-xs text-red-400 mt-1">{aliasError}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingAlias(false);
                    setAliasError('');
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
                >
                  Save Alias
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
