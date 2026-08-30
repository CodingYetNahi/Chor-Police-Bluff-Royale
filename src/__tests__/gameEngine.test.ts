import { describe, it, expect } from 'vitest';
import { GameEngine } from '../services/gameEngine';
import { SeededRandom, createBotState, updateBotSuspicion, determineBotVote } from '../features/bots/botEngine';
import { validateAlias } from '../utils/filter';
import { SEED_CASES } from '../content/cases';

describe('Chor Police Game Engine & Bot Rules', () => {
  it('seeded random is reproducible', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    const values1 = [rng1.next(), rng1.next(), rng1.nextInt(1, 100)];
    const values2 = [rng2.next(), rng2.next(), rng2.nextInt(1, 100)];

    expect(values1).toEqual(values2);
  });

  it('validates custom aliases correctly with safety filters', () => {
    expect(validateAlias('Valid Player').isValid).toBe(true);
    expect(validateAlias('ab').isValid).toBe(false); // too short (<3)
    expect(validateAlias('ThisAliasIsWayTooLongForGame').isValid).toBe(false); // >16
    expect(validateAlias('admin').isValid).toBe(false); // prohibited
    expect(validateAlias('cheat_master').isValid).toBe(false); // prohibited / special characters
  });

  it('creates 6-seat room with isolated private states', () => {
    const engine = new GameEngine();
    const room = engine.createPrivateRoom('user_host_123', 'Host Tiger', 'FILL_WITH_BOTS');

    expect(room.seats.length).toBe(6);
    expect(room.isPrivate).toBe(true);
    expect(room.code.length).toBe(6);

    const startRes = engine.startMatch(room.id, true);
    expect(startRes.success).toBe(true);

    const hostPrivate = engine.getPrivateState(room.id, 'user_host_123');
    expect(hostPrivate).toBeDefined();
    expect(hostPrivate?.role).toBeDefined();
    expect(hostPrivate?.privateClue).toBeDefined();

    // Check that all 6 seats are filled
    const startedRoom = engine.getRoom(room.id);
    expect(startedRoom?.seats.every((s) => s.uid)).toBe(true);
  });

  it('updates bot suspicion when contradiction statements are made', () => {
    const activeCase = SEED_CASES[0];
    const bot = createBotState(1, 'POLICE', 'EVIDENCE_FOCUSED', 'Verified log');

    const contradictedLog = {
      id: 'log_1',
      timestamp: Date.now(),
      actorSeatIndex: 0,
      actorAlias: 'Suspect Player',
      actionType: 'STATEMENT' as const,
      content: activeCase.allowedStatements.find((s) => s.id === 'stmt-2')!.text
    };

    const updated = updateBotSuspicion(bot, [contradictedLog], activeCase);
    expect(updated.suspicionMap[0]).toBeGreaterThan(20);
  });

  it('contains 20 verified cases in content archive', () => {
    expect(SEED_CASES.length).toBe(20);
    SEED_CASES.forEach((c) => {
      expect(c.title).toBeTruthy();
      expect(c.location).toBeTruthy();
      expect(c.publicEvidence.length).toBeGreaterThanOrEqual(3);
      expect(c.roleClues.citizenClues.length).toBeGreaterThanOrEqual(2);
      expect(c.allowedStatements.length).toBeGreaterThanOrEqual(4);
      expect(c.plantDoubtOptions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
