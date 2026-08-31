export const ROLE_DECK = ['CHOR', 'POLICE', 'INFORMER', 'PROTECTOR', 'CITIZEN', 'CITIZEN'] as const;
export type ServerRole = (typeof ROLE_DECK)[number];

export interface ResolutionPlayer {
  uid: string;
  seatIndex: number;
  role: ServerRole;
  isBot: boolean;
}

export interface ScoreLine extends ResolutionPlayer {
  points: number;
  won: boolean;
}

export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

export function seededRoles(seed: string): ServerRole[] {
  const deck = [...ROLE_DECK];
  let state = hashSeed(seed) || 1;
  for (let index = deck.length - 1; index > 0; index--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const target = state % (index + 1);
    [deck[index], deck[target]] = [deck[target], deck[index]];
  }
  return deck;
}

export function tallyVotes(votes: readonly number[]): Map<number, number> {
  const tally = new Map<number, number>();
  for (const seat of votes) tally.set(seat, (tally.get(seat) ?? 0) + 1);
  return tally;
}

export function tiedLeaders(tally: ReadonlyMap<number, number>): number[] {
  const highest = Math.max(0, ...tally.values());
  if (highest === 0) return [];
  return [...tally]
    .filter(([, count]) => count === highest)
    .map(([seat]) => seat)
    .sort((a, b) => a - b);
}

export function deterministicTieTarget(roomId: string, round: number, seats: readonly number[]): number {
  if (!seats.length) return -1;
  const ordered = [...seats].sort((a, b) => a - b);
  return ordered[hashSeed(`${roomId}:${round}:tie`) % ordered.length];
}

export function botVote(
  seed: string,
  botSeat: number,
  validTargets: readonly number[],
  suspicion: Readonly<Record<number, number>> = {},
): number {
  const targets = validTargets.filter((seat) => seat !== botSeat).sort((a, b) => a - b);
  if (!targets.length) return -1;
  const roll = hashSeed(`${seed}:${botSeat}:mistake`);
  if (roll % 7 === 0) return targets[roll % targets.length];
  const highest = Math.max(...targets.map((seat) => suspicion[seat] ?? 0));
  const likely = targets.filter((seat) => (suspicion[seat] ?? 0) === highest);
  return likely[hashSeed(`${seed}:${botSeat}:vote`) % likely.length];
}

export function calculateScores(
  players: readonly ResolutionPlayer[],
  accusedSeat: number,
  protectedSeat: number | null,
  informerTarget: number | null,
): { winningTeam: 'POLICE_SIDE' | 'CHOR_SIDE'; lines: ScoreLine[] } {
  const chor = players.find((player) => player.role === 'CHOR');
  if (!chor) throw new Error('Exactly one Chor is required.');
  const chorCaught = accusedSeat === chor.seatIndex && protectedSeat !== chor.seatIndex;
  return {
    winningTeam: chorCaught ? 'POLICE_SIDE' : 'CHOR_SIDE',
    lines: players.map((player) => {
      const won = player.role === 'CHOR' ? !chorCaught : chorCaught;
      let points = won ? 100 : 20;
      if (player.role === 'CHOR' && !chorCaught) points += accusedSeat >= 0 ? 50 : 25;
      if (player.role === 'INFORMER' && informerTarget === chor.seatIndex) points += 40;
      if (player.role === 'PROTECTOR' && protectedSeat === accusedSeat && accusedSeat !== chor.seatIndex)
        points += 30;
      if (player.role === 'POLICE' && accusedSeat === chor.seatIndex) points += 30;
      return { ...player, points, won };
    }),
  };
}

export function isEntitlementActive(expiresAtMs: number, nowMs: number): boolean {
  return expiresAtMs > nowMs;
}
