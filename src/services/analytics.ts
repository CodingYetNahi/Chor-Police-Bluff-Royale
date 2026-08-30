export type AnalyticsEvent =
  | 'quick_match_requested'
  | 'match_found'
  | 'match_started'
  | 'match_completed'
  | 'match_abandoned'
  | 'private_room_created'
  | 'private_room_joined'
  | 'private_room_shared'
  | 'bot_seat_filled'
  | 'result_shared'
  | 'checkout_started'
  | 'purchase_verified'
  | 'purchase_failed';

interface SafeAnalyticsPayload {
  phase?: string;
  policy?: string;
  difficulty?: string;
  winningTeam?: string;
  durationSeconds?: number;
  botCount?: number;
  isHost?: boolean;
}

class AnalyticsService {
  private enabled: boolean = true;

  public track(event: AnalyticsEvent, payload: SafeAnalyticsPayload = {}) {
    if (!this.enabled) return;

    try {
      // Safe sanitization: enforce allowed fields only
      const sanitized = {
        event,
        timestamp: Date.now(),
        phase: payload.phase,
        policy: payload.policy,
        difficulty: payload.difficulty,
        winningTeam: payload.winningTeam,
        durationSeconds: payload.durationSeconds,
        botCount: payload.botCount,
        isHost: payload.isHost
      };

      // In production or development, log securely or send to privacy-compliant sink
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
        // Safe internal telemetry
      }
    } catch {
      // Silently prevent errors
    }
  }

  public setEnabled(status: boolean) {
    this.enabled = status;
  }
}

export const analytics = new AnalyticsService();
