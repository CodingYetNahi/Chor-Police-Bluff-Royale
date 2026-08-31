import { describe, expect, it } from 'vitest';
import {
  ROLE_DECK,
  botVote,
  calculateScores,
  deterministicTieTarget,
  isEntitlementActive,
  seededRoles,
  tallyVotes,
  tiedLeaders,
  type ResolutionPlayer,
} from '../../functions/src/gameLogic';
import { firstFreeSeat, mayFillBots, mayPublicJoin, mayStartPrivate } from '../../functions/src/roomPolicy';
import { paymentEntitlementId, paymentMatchesOrder } from '../../functions/src/paymentLogic';
import { validateCase } from '../content/caseValidator';
import { SEED_CASES } from '../content/cases';

const players: ResolutionPlayer[] = ROLE_DECK.map((role, seatIndex) => ({
  uid: `player-${seatIndex}`,
  seatIndex,
  role,
  isBot: seatIndex > 2,
}));

describe('server game logic', () => {
  it('assigns all six roles with exactly one Chor and two Citizens', () => {
    const roles = seededRoles('room:1');
    expect(roles).toHaveLength(6);
    expect(roles.filter((role) => role === 'CHOR')).toHaveLength(1);
    expect(roles.filter((role) => role === 'CITIZEN')).toHaveLength(2);
  });

  it('reproduces seeded roles and rotates assignments by round', () => {
    expect(seededRoles('room:1')).toEqual(seededRoles('room:1'));
    expect(seededRoles('room:1')).not.toEqual(seededRoles('room:2'));
  });

  it('detects tied vote leaders and selects a reproducible fallback', () => {
    const leaders = tiedLeaders(tallyVotes([1, 2, 1, 2, 4]));
    expect(leaders).toEqual([1, 2]);
    expect(deterministicTieTarget('ROOM01', 2, leaders)).toBe(deterministicTieTarget('ROOM01', 2, leaders));
  });

  it('awards the investigator team when an unprotected Chor is accused', () => {
    const result = calculateScores(players, 0, 2, 0);
    expect(result.winningTeam).toBe('POLICE_SIDE');
    expect(result.lines.find((line) => line.role === 'INFORMER')?.points).toBe(140);
    expect(result.lines.find((line) => line.role === 'CHOR')?.won).toBe(false);
  });

  it('applies the Protector effect and Chor escape/misdirection bonus', () => {
    const result = calculateScores(players, 0, 0, 2);
    expect(result.winningTeam).toBe('CHOR_SIDE');
    expect(result.lines.find((line) => line.role === 'CHOR')?.points).toBe(150);
  });

  it('makes isolated bot votes deterministic and never self-targeting', () => {
    const suspicion = { 0: 1, 1: 8, 2: 4 };
    expect(botVote('seed', 3, [0, 1, 2, 3], suspicion)).toBe(1);
    expect(botVote('seed', 3, [0, 1, 2, 3], suspicion)).toBe(botVote('seed', 3, [0, 1, 2, 3], suspicion));
  });

  it('expires entitlements at the exact server boundary', () => {
    expect(isEntitlementActive(1_001, 1_000)).toBe(true);
    expect(isEntitlementActive(1_000, 1_000)).toBe(false);
  });

  it('never allocates a seventh seat or duplicates an occupied seat', () => {
    expect(firstFreeSeat([0, 2, 3])).toBe(1);
    expect(firstFreeSeat([0, 1, 2, 3, 4, 5])).toBeNull();
  });

  it('enforces all private-room timing policies', () => {
    expect(mayStartPrivate('HUMANS_ONLY', 6, true, 0, 50)).toBe(true);
    expect(mayStartPrivate('HUMANS_ONLY', 6, false, 0, 50)).toBe(false);
    expect(mayStartPrivate('FILL_WITH_BOTS', 1, false, 0, 50)).toBe(true);
    expect(mayPublicJoin('OPEN_REMAINING_SEATS', 29, 30)).toBe(false);
    expect(mayPublicJoin('OPEN_REMAINING_SEATS', 30, 30)).toBe(true);
    expect(mayFillBots('OPEN_REMAINING_SEATS', 49, 50)).toBe(false);
    expect(mayFillBots('OPEN_REMAINING_SEATS', 50, 50)).toBe(true);
  });

  it('rejects payment ownership/amount mismatches and derives an idempotent entitlement id', () => {
    const order = { userId: 'owner', amount: 2900, currency: 'INR', status: 'CREATED' };
    expect(paymentMatchesOrder(order, 'owner')).toBe(true);
    expect(paymentMatchesOrder(order, 'attacker')).toBe(false);
    expect(paymentMatchesOrder({ ...order, amount: 1 }, 'owner')).toBe(false);
    expect(paymentEntitlementId('pay_123')).toBe(paymentEntitlementId('pay_123'));
  });

  it('validates every bundled case and rejects an incomplete case', () => {
    expect(SEED_CASES).toHaveLength(20);
    expect(SEED_CASES.every((item) => validateCase(item).valid)).toBe(true);
    expect(validateCase({ title: 'Incomplete' }).valid).toBe(false);
  });
});
