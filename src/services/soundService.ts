import { UserSettings } from '../types';

class SoundService {
  private audioCtx: AudioContext | null = null;
  private settings: UserSettings = {
    masterSound: true,
    musicEnabled: true,
    sfxEnabled: true,
    vibrationEnabled: true,
    reducedMotion: false,
    alias: 'Silent Tiger',
  };

  constructor() {
    this.loadSettings();
  }

  public loadSettings(): UserSettings {
    try {
      const stored = localStorage.getItem('cp_settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore storage errors
    }
    return this.settings;
  }

  public saveSettings(newSettings: Partial<UserSettings>): UserSettings {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('cp_settings', JSON.stringify(this.settings));
    } catch {
      // Ignore storage errors
    }
    return this.settings;
  }

  public getSettings(): UserSettings {
    return { ...this.settings };
  }

  private initAudio(): AudioContext | null {
    if (!this.settings.masterSound) return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public triggerHaptic(pattern: number | number[] = 30) {
    if (this.settings.vibrationEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore vibration errors
      }
    }
  }

  public playPhaseStart() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic([30, 40, 30]);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3); // A5

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playTimerTick() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic(15);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(750, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playActionSubmit() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic(25);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playVoteCast() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic(50);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(165, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playRevealChor() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic([60, 40, 80]);

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(220, now); // A3
    osc1.frequency.exponentialRampToValueAtTime(110, now + 0.8);

    osc2.frequency.setValueAtTime(277.18, now); // C#4
    osc2.frequency.exponentialRampToValueAtTime(138.59, now + 0.8);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  }

  public playVictory() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic([40, 30, 40, 30, 70]);

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  public playDefeat() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic(80);

    const notes = [440, 415.3, 392, 369.99]; // Downward slide
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.35);
    });
  }

  public playProtect() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic([30, 30]);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playPlantDoubt() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic(40);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playCardFlip() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic([20, 30]);

    const now = ctx.currentTime;
    // Card swoosh whoosh sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playSecretClue() {
    if (!this.settings.masterSound || !this.settings.sfxEnabled) return;
    const ctx = this.initAudio();
    if (!ctx) return;

    this.triggerHaptic([30, 20, 40]);

    const now = ctx.currentTime;
    const chimeFrequencies = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6

    chimeFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.45);
    });
  }
}

export const sound = new SoundService();
