export type PrivatePolicy = 'HUMANS_ONLY' | 'FILL_WITH_BOTS' | 'OPEN_REMAINING_SEATS';

export function firstFreeSeat(occupiedSeats: readonly number[], capacity = 6): number | null {
  const occupied = new Set(occupiedSeats);
  for (let seat = 0; seat < capacity; seat++) if (!occupied.has(seat)) return seat;
  return null;
}

export function mayPublicJoin(policy: PrivatePolicy, nowMs: number, publicAtMs: number): boolean {
  return policy === 'OPEN_REMAINING_SEATS' && nowMs >= publicAtMs;
}

export function mayFillBots(policy: PrivatePolicy, nowMs: number, botFillAtMs: number): boolean {
  return policy === 'FILL_WITH_BOTS' || (policy === 'OPEN_REMAINING_SEATS' && nowMs >= botFillAtMs);
}

export function mayStartPrivate(
  policy: PrivatePolicy,
  humanCount: number,
  allReady: boolean,
  nowMs: number,
  botFillAtMs: number,
): boolean {
  if (humanCount > 6) return false;
  if (policy === 'HUMANS_ONLY') return humanCount === 6 && allReady;
  if (policy === 'FILL_WITH_BOTS') return humanCount >= 1;
  return humanCount === 6 || nowMs >= botFillAtMs;
}
