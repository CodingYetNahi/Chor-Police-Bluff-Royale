import React, { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { sound } from '../services/soundService';
import {
  Volume2,
  VolumeX,
  Vibrate,
  SmartphoneNfc,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { alias, rerollAlias, updateAlias, settings, updateSettings } = useAuth();

  const [aliasInput, setAliasInput] = useState(alias);
  const [aliasMessage, setAliasMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAliasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateAlias(aliasInput);
    if (res.success) {
      sound.playActionSubmit();
      setAliasMessage({ type: 'success', text: 'Alias updated successfully.' });
      setTimeout(() => setAliasMessage(null), 3000);
    } else {
      setAliasMessage({ type: 'error', text: res.error || 'Invalid alias format.' });
    }
  };

  const handleResetStorage = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-mono text-amber-400">Customization</span>
        <h1 className="text-3xl font-black text-slate-100">Preferences & Audio</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your anonymous identity, synthesized Web Audio toggles, and local browser state.
        </p>
      </div>

      {/* Identity Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Display Alias
        </h2>
        <p className="text-xs text-slate-400">
          Your alias is displayed to other seated players during public matches and private rooms.
        </p>

        <form onSubmit={handleAliasSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              maxLength={16}
              placeholder="e.g. Silent Tiger"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() => {
                rerollAlias();
                sound.playActionSubmit();
                setAliasInput(localStorage.getItem('cp_player_alias') || 'Silent Tiger');
              }}
              title="Reroll Safe Name"
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              Reroll
            </button>
          </div>

          {aliasMessage && (
            <p
              className={`text-xs ${
                aliasMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {aliasMessage.text}
            </p>
          )}

          <button
            type="submit"
            className="py-2.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Audio & Haptic Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          Sound & Acoustics (Web Audio API)
        </h2>

        <div className="space-y-3 divide-y divide-slate-800">
          {/* Master Sound */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Master Audio</p>
              <p className="text-xs text-slate-400">All harmonic phase chords and countdown ticks</p>
            </div>
            <button
              onClick={() => {
                const updated = !settings.masterSound;
                updateSettings({ masterSound: updated });
                if (updated) sound.playActionSubmit();
              }}
              className={`p-3 rounded-2xl border transition-all ${
                settings.masterSound
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              {settings.masterSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Sound Effects SFX */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Sound Effects & Fanfares</p>
              <p className="text-xs text-slate-400">Gavel impacts, action pops, and reveal tones</p>
            </div>
            <button
              onClick={() => {
                const updated = !settings.sfxEnabled;
                updateSettings({ sfxEnabled: updated });
                if (updated) sound.playActionSubmit();
              }}
              className={`p-3 rounded-2xl border transition-all ${
                settings.sfxEnabled
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              {settings.sfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Haptics */}
          <div className="pt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Vibration & Haptics</p>
              <p className="text-xs text-slate-400">Haptic tactile pulse feedback on mobile devices</p>
            </div>
            <button
              onClick={() => {
                const updated = !settings.vibrationEnabled;
                updateSettings({ vibrationEnabled: updated });
                if (updated) sound.triggerHaptic(60);
              }}
              className={`p-3 rounded-2xl border transition-all ${
                settings.vibrationEnabled
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              {settings.vibrationEnabled ? (
                <Vibrate className="w-5 h-5 text-amber-400" />
              ) : (
                <SmartphoneNfc className="w-5 h-5 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Storage & Privacy Reset */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Local Data & Storage
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your anonymous session ID, sound preferences, and match stats are stored strictly inside your browser's local storage. Clearing storage resets all career statistics.
        </p>

        {showClearConfirm ? (
          <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you certain? This action cannot be undone.</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetStorage}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Permanently Clear Storage
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="py-2.5 px-5 rounded-2xl bg-slate-950 hover:bg-red-950/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Reset Local Game History
          </button>
        )}
      </div>
    </div>
  );
};
