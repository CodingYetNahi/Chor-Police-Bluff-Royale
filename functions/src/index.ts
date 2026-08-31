import { createHmac, timingSafeEqual } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import {
  botVote,
  calculateScores,
  deterministicTieTarget,
  seededRoles,
  tallyVotes,
  tiedLeaders,
  type ResolutionPlayer,
} from './gameLogic';
import { firstFreeSeat, mayPublicJoin, mayStartPrivate } from './roomPolicy';
import { HOST_PASS, paymentEntitlementId, paymentMatchesOrder } from './paymentLogic';

if (!getApps().length) initializeApp();
const db = getFirestore();
const seats = 6;
const policies = ['HUMANS_ONLY', 'FILL_WITH_BOTS', 'OPEN_REMAINING_SEATS'] as const;
const phases = [
  'CASE_INTRO',
  'SECRET_ROLE',
  'EVIDENCE_REVIEW',
  'INVESTIGATION',
  'SPECIAL_ACTIONS',
  'FINAL_VOTING',
  'TIE_BREAK',
  'REVEAL',
] as const;
const durations = [15, 20, 45, 90, 30, 30, 15, 45];
type Data = Record<string, unknown>;

function uid(request: { auth?: { uid: string } }): string {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  return request.auth.uid;
}
function input(value: unknown, allowed: string[]): Data {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new HttpsError('invalid-argument', 'Object input required.');
  const data = value as Data;
  if (Object.keys(data).some((key) => !allowed.includes(key)))
    throw new HttpsError('invalid-argument', 'Unexpected input field.');
  return data;
}
function text(value: unknown, name: string, max = 80): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new HttpsError('invalid-argument', `Invalid ${name}.`);
  return value.trim();
}
function code(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}
const callable = { enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== 'true', cors: true };
const roomRef = (id: string) => db.collection('rooms').doc(id);

async function systemConfig() {
  return (await db.collection('systemConfig').doc('gameplay').get()).data() ?? {};
}
async function ensureGameAvailable() {
  if ((await systemConfig()).maintenance === true)
    throw new HttpsError('unavailable', 'Matchmaking is temporarily under maintenance.');
}
async function phaseDuration(phase: (typeof phases)[number]): Promise<number> {
  const configured = (await systemConfig()).phaseDurations?.[phase];
  return Number.isInteger(configured) && configured >= 10 && configured <= 300
    ? configured
    : durations[phases.indexOf(phase)];
}

async function activeRoom(playerUid: string): Promise<string | null> {
  const snap = await db.collection('players').doc(playerUid).get();
  return (snap.data()?.activeRoomId as string | undefined) ?? null;
}
async function rateLimit(playerUid: string, operation: string, seconds = 1) {
  const ref = db.collection('rateLimits').doc(`${playerUid}_${operation}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const last = snap.data()?.at as Timestamp | undefined;
    if (last && Date.now() - last.toMillis() < seconds * 1000)
      throw new HttpsError('resource-exhausted', 'Please wait before trying again.');
    tx.set(ref, { at: Timestamp.now() }, { merge: true });
  });
}

export const initializePlayer = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const data = input(request.data, ['alias']);
  const alias = text(data.alias, 'alias', 16);
  const ref = db.collection('players').doc(playerUid);
  await db.runTransaction(async (tx) => {
    const player = await tx.get(ref);
    if (player.exists) tx.update(ref, { alias, updatedAt: FieldValue.serverTimestamp() });
    else
      tx.create(ref, {
        alias,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        stats: { matchesPlayed: 0, wins: 0, score: 0 },
      });
  });
  return { uid: playerUid };
});
export const submitReport = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['category', 'content', 'roomId']);
  const category = text(d.category, 'category', 40);
  const content = text(d.content, 'content', 500);
  await rateLimit(playerUid, 'report', 30);
  const report = db.collection('reports').doc();
  await report.create({
    reporterUid: playerUid,
    category,
    content,
    roomId: d.roomId ? text(d.roomId, 'roomId') : null,
    createdAt: FieldValue.serverTimestamp(),
    status: 'OPEN',
  });
  return { reportId: report.id };
});

async function joinTransaction(playerUid: string, alias: string, id: string, publicJoin = false) {
  return db.runTransaction(async (tx) => {
    const room = roomRef(id);
    const member = room.collection('members').doc(playerUid);
    const player = db.collection('players').doc(playerUid);
    const [roomSnap, memberSnap, playerSnap] = await Promise.all([
      tx.get(room),
      tx.get(member),
      tx.get(player),
    ]);
    if (!roomSnap.exists) throw new HttpsError('not-found', 'Room not found or expired.');
    const state = roomSnap.data()!;
    if (memberSnap.exists) return Number(state.occupancy);
    if (playerSnap.data()?.activeRoomId)
      throw new HttpsError('failed-precondition', 'Leave your current room first.');
    if (state.status !== 'LOBBY')
      throw new HttpsError('failed-precondition', 'This match has already started.');
    if ((state.occupancy as number) >= seats)
      throw new HttpsError('resource-exhausted', 'This room is full.');
    if (
      publicJoin &&
      state.isPrivate &&
      !mayPublicJoin(state.policy, Date.now(), (state.publicAt as Timestamp).toMillis())
    )
      throw new HttpsError('permission-denied', 'This private room is not open to public matchmaking.');
    const seat = firstFreeSeat((state.occupiedSeats as number[]) ?? [], seats);
    if (seat === null) throw new HttpsError('resource-exhausted', 'This room is full.');
    tx.create(member, {
      uid: playerUid,
      alias,
      seatIndex: seat,
      isBot: false,
      isReady: !state.isPrivate,
      joinedAt: FieldValue.serverTimestamp(),
    });
    tx.update(room, { occupancy: FieldValue.increment(1), occupiedSeats: FieldValue.arrayUnion(seat) });
    tx.set(player, { activeRoomId: id, alias, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return Number(state.occupancy) + 1;
  });
}

export const requestQuickMatch = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const data = input(request.data, ['alias']);
  const alias = text(data.alias, 'alias', 16);
  await ensureGameAvailable();
  await rateLimit(playerUid, 'matchmaking', 2);
  const current = await activeRoom(playerUid);
  if (current) return { roomId: current };
  const now = Timestamp.now();
  const [publicRooms, openedPrivateRooms] = await Promise.all([
    db
      .collection('rooms')
      .where('matchmakingOpen', '==', true)
      .where('status', '==', 'LOBBY')
      .limit(10)
      .get(),
    db
      .collection('rooms')
      .where('policy', '==', 'OPEN_REMAINING_SEATS')
      .where('status', '==', 'LOBBY')
      .where('publicAt', '<=', now)
      .limit(10)
      .get(),
  ]);
  const candidates = new Map(
    [...publicRooms.docs, ...openedPrivateRooms.docs].map((item) => [item.id, item]),
  );
  for (const candidate of candidates.values()) {
    try {
      const occupancy = await joinTransaction(playerUid, alias, candidate.id, true);
      if (occupancy === seats) await start(candidate.id, '__system__', false);
      return { roomId: candidate.id };
    } catch (error) {
      if (error instanceof HttpsError && ['resource-exhausted', 'permission-denied'].includes(error.code))
        continue;
      throw error;
    }
  }
  const room = roomRef(code());
  await db.runTransaction(async (tx) => {
    const player = db.collection('players').doc(playerUid);
    const ps = await tx.get(player);
    if (ps.data()?.activeRoomId) throw new HttpsError('failed-precondition', 'Already in a room.');
    tx.create(room, {
      code: room.id,
      hostUid: playerUid,
      isPrivate: false,
      policy: 'FILL_WITH_BOTS',
      status: 'LOBBY',
      matchmakingOpen: true,
      occupancy: 1,
      occupiedSeats: [0],
      createdAt: now,
      humanDeadline: Timestamp.fromMillis(now.toMillis() + 20_000),
      phaseVersion: 0,
    });
    tx.create(room.collection('members').doc(playerUid), {
      uid: playerUid,
      alias,
      seatIndex: 0,
      isBot: false,
      isReady: true,
      joinedAt: now,
    });
    tx.set(player, { activeRoomId: room.id, alias, updatedAt: now }, { merge: true });
  });
  return { roomId: room.id };
});

export const createPrivateRoom = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const data = input(request.data, ['alias', 'policy']);
  const alias = text(data.alias, 'alias', 16);
  await ensureGameAvailable();
  const policy = data.policy ?? 'FILL_WITH_BOTS';
  if (!policies.includes(policy as never)) throw new HttpsError('invalid-argument', 'Invalid room policy.');
  const current = await activeRoom(playerUid);
  if (current) return { roomId: current, code: current };
  const entitlement = db.collection('entitlements').doc(`trial_${playerUid}`);
  const room = roomRef(code());
  const now = Timestamp.now();
  await db.runTransaction(async (tx) => {
    const playerRef = db.collection('players').doc(playerUid);
    const activePassesQuery = db
      .collection('entitlements')
      .where('userId', '==', playerUid)
      .where('status', '==', 'ACTIVE')
      .where('expiresAt', '>', now)
      .limit(1);
    const [trial, player, activePasses] = await Promise.all([
      tx.get(entitlement),
      tx.get(playerRef),
      tx.get(activePassesQuery),
    ]);
    if (player.data()?.activeRoomId)
      throw new HttpsError('failed-precondition', 'Leave your current room first.');
    if (!trial.exists)
      tx.create(entitlement, {
        userId: playerUid,
        type: 'FIRST_TRIAL_FREE',
        status: 'ACTIVE',
        createdAt: now,
        expiresAt: Timestamp.fromMillis(now.toMillis() + 2 * 60 * 60_000),
      });
    else if (activePasses.empty) throw new HttpsError('permission-denied', 'A valid host pass is required.');
    tx.create(room, {
      code: room.id,
      hostUid: playerUid,
      isPrivate: true,
      policy,
      status: 'LOBBY',
      matchmakingOpen: false,
      occupancy: 1,
      occupiedSeats: [0],
      createdAt: now,
      invitePriorityEndsAt: Timestamp.fromMillis(now.toMillis() + 30_000),
      publicAt: Timestamp.fromMillis(now.toMillis() + 30_000),
      botFillAt: Timestamp.fromMillis(now.toMillis() + 50_000),
      phaseVersion: 0,
    });
    tx.create(room.collection('members').doc(playerUid), {
      uid: playerUid,
      alias,
      seatIndex: 0,
      isBot: false,
      isReady: false,
      joinedAt: now,
    });
    tx.set(playerRef, { activeRoomId: room.id, alias, updatedAt: now }, { merge: true });
  });
  return { roomId: room.id, code: room.id };
});

export const claimPrivateRoomTrial = onCall(callable, async (request) => {
  const playerUid = uid(request);
  input(request.data, []);
  const ref = db.collection('entitlements').doc(`trial_${playerUid}`);
  const snap = await ref.get();
  if (snap.exists) return { claimed: false };
  await ref.create({
    userId: playerUid,
    type: 'FIRST_TRIAL_FREE',
    status: 'ACTIVE',
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + 7_200_000),
  });
  return { claimed: true };
});

export const joinRoomByCode = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const data = input(request.data, ['alias', 'code']);
  const alias = text(data.alias, 'alias', 16);
  await ensureGameAvailable();
  const roomCode = text(data.code, 'code', 6).toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(roomCode)) throw new HttpsError('invalid-argument', 'Invalid room code.');
  await joinTransaction(playerUid, alias, roomCode);
  return { roomId: roomCode };
});

export const toggleReady = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const data = input(request.data, ['roomId', 'ready']);
  const id = text(data.roomId, 'roomId');
  if (typeof data.ready !== 'boolean') throw new HttpsError('invalid-argument', 'ready must be boolean.');
  const member = roomRef(id).collection('members').doc(playerUid);
  if (!(await member.get()).exists) throw new HttpsError('permission-denied', 'Not a room member.');
  await member.update({ isReady: data.ready });
  return { ok: true };
});

export const updateRoomPolicy = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const data = input(request.data, ['roomId', 'policy']);
  const id = text(data.roomId, 'roomId');
  if (!policies.includes(data.policy as never)) throw new HttpsError('invalid-argument', 'Invalid policy.');
  await db.runTransaction(async (tx) => {
    const ref = roomRef(id);
    const snap = await tx.get(ref);
    if (snap.data()?.hostUid !== playerUid || snap.data()?.status !== 'LOBBY')
      throw new HttpsError('permission-denied', 'Only the lobby host can change policy.');
    const now = Date.now();
    tx.update(ref, {
      policy: data.policy,
      matchmakingOpen:
        data.policy === 'OPEN_REMAINING_SEATS' && now >= (snap.data()?.publicAt as Timestamp).toMillis(),
    });
  });
  return { ok: true };
});

async function start(id: string, actorUid: string, allowBots: boolean) {
  const ref = roomRef(id);
  const introDuration = await phaseDuration('CASE_INTRO');
  await db.runTransaction(async (tx) => {
    const [snap, members] = await Promise.all([
      tx.get(ref),
      tx.get(ref.collection('members').orderBy('seatIndex')),
    ]);
    const state = snap.data();
    if (!state || state.status !== 'LOBBY') return;
    if (state.isPrivate && state.hostUid !== actorUid && actorUid !== '__system__')
      throw new HttpsError('permission-denied', 'Only the host can start.');
    const humans = members.docs.map((d) => d.data());
    if (
      state.isPrivate &&
      !mayStartPrivate(
        state.policy,
        humans.length,
        humans.every((member) => member.isReady),
        Date.now(),
        (state.botFillAt as Timestamp | undefined)?.toMillis() ?? 0,
      )
    )
      throw new HttpsError('failed-precondition', 'This private-room policy does not permit starting yet.');
    if (humans.length < seats && !allowBots)
      throw new HttpsError('failed-precondition', 'Waiting for players.');
    const occupied = new Set(humans.map((m) => m.seatIndex as number));
    const all = [...humans];
    for (let seat = 0; seat < seats; seat++)
      if (!occupied.has(seat)) {
        const bot = {
          uid: `bot_${id}_${seat}`,
          alias: `Detective Bot ${seat + 1}`,
          seatIndex: seat,
          isBot: true,
          isReady: true,
          botPersonality: [
            'EVIDENCE_FOCUSED',
            'CONFIDENT_ACCUSER',
            'QUIET_OBSERVER',
            'NERVOUS_DEFENDER',
            'EASILY_PERSUADED',
            'STRATEGIC_BLUFFER',
          ][seat],
        };
        all.push(bot);
        tx.create(ref.collection('members').doc(bot.uid), bot);
      }
    all.sort((a, b) => a.seatIndex - b.seatIndex);
    const round = Number(state.round ?? 0) + 1;
    const shuffled = seededRoles(`${id}:${round}`);
    all.forEach((member, index) => {
      const secret = {
        seatIndex: member.seatIndex,
        role: shuffled[index],
        privateClue: `Case clue ${index + 1}`,
        objective: shuffled[index] === 'CHOR' ? 'Avoid the final accusation.' : 'Identify the Chor.',
      };
      if (member.isBot) tx.set(ref.collection('serverPrivateState').doc(member.uid), secret);
      else tx.set(ref.collection('privateState').doc(member.uid), secret);
    });
    tx.update(ref, {
      status: 'IN_GAME',
      matchmakingOpen: false,
      occupancy: seats,
      occupiedSeats: [0, 1, 2, 3, 4, 5],
      currentPhase: phases[0],
      phaseEndsAt: Timestamp.fromMillis(Date.now() + introDuration * 1000),
      phaseVersion: FieldValue.increment(1),
      round,
      caseIndex: (Number(state.caseIndex ?? -1) + 1) % 20,
      protectedSeatIndex: null,
      informerTargetSeatIndex: null,
      accusedSeatIndex: null,
      result: null,
    });
  });
}

export const startMatch = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId']);
  await start(text(d.roomId, 'roomId'), playerUid, true);
  return { ok: true };
});
export const fillBots = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId']);
  const id = text(d.roomId, 'roomId');
  const room = await roomRef(id).get();
  const state = room.data();
  if (!state) throw new HttpsError('not-found', 'Room not found.');
  const deadline = (state.isPrivate ? state.botFillAt : state.humanDeadline) as Timestamp;
  if (Date.now() < deadline.toMillis())
    throw new HttpsError('failed-precondition', 'The human waiting period has not ended.');
  await start(id, playerUid, true);
  return { ok: true };
});

export const leaveLobby = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId']);
  const id = text(d.roomId, 'roomId');
  const ref = roomRef(id);
  await db.runTransaction(async (tx) => {
    const room = await tx.get(ref);
    const member = await tx.get(ref.collection('members').doc(playerUid));
    if (!room.exists || !member.exists) return;
    if (room.data()?.status !== 'LOBBY')
      throw new HttpsError('failed-precondition', 'Seats are preserved during a match.');
    tx.delete(member.ref);
    tx.update(db.collection('players').doc(playerUid), { activeRoomId: FieldValue.delete() });
    const remaining = (
      await ref.collection('members').where('isBot', '==', false).orderBy('seatIndex').get()
    ).docs.filter((x) => x.id !== playerUid);
    if (!remaining.length) tx.delete(ref);
    else
      tx.update(ref, {
        occupancy: FieldValue.increment(-1),
        occupiedSeats: FieldValue.arrayRemove(member.data()?.seatIndex),
        hostUid: room.data()?.hostUid === playerUid ? remaining[0].id : room.data()?.hostUid,
      });
  });
  return { ok: true };
});

async function member(id: string, playerUid: string) {
  const snap = await roomRef(id).collection('members').doc(playerUid).get();
  if (!snap.exists) throw new HttpsError('permission-denied', 'Not a member.');
  return snap.data()!;
}
export const submitStructuredAction = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId', 'actionType', 'content', 'targetSeatIndex', 'requestId']);
  const id = text(d.roomId, 'roomId');
  const m = await member(id, playerUid);
  const room = await roomRef(id).get();
  if (
    room.data()?.currentPhase !== 'INVESTIGATION' ||
    (room.data()?.phaseEndsAt as Timestamp).toMillis() < Date.now()
  )
    throw new HttpsError('failed-precondition', 'Action is late or out of phase.');
  const requestId = text(d.requestId, 'requestId');
  await roomRef(id)
    .collection('actions')
    .doc(requestId)
    .create({
      actorUid: playerUid,
      actorSeatIndex: m.seatIndex,
      actionType: text(d.actionType, 'actionType', 30),
      content: text(d.content, 'content', 300),
      targetSeatIndex: d.targetSeatIndex ?? null,
      createdAt: FieldValue.serverTimestamp(),
    })
    .catch((e) => {
      if (e.code !== 6) throw e;
    });
  return { ok: true };
});
export const submitSpecialAction = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId', 'actionType', 'targetSeatIndex', 'requestId']);
  const id = text(d.roomId, 'roomId');
  const m = await member(id, playerUid);
  const room = await roomRef(id).get();
  if (
    room.data()?.currentPhase !== 'SPECIAL_ACTIONS' ||
    (room.data()?.phaseEndsAt as Timestamp).toMillis() < Date.now()
  )
    throw new HttpsError('failed-precondition', 'Action is late or out of phase.');
  if (
    !Number.isInteger(d.targetSeatIndex) ||
    d.targetSeatIndex === m.seatIndex ||
    Number(d.targetSeatIndex) < 0 ||
    Number(d.targetSeatIndex) >= seats
  )
    throw new HttpsError('invalid-argument', 'Invalid target.');
  const privateState = await roomRef(id).collection('privateState').doc(playerUid).get();
  const role = privateState.data()?.role as string | undefined;
  const expectedAction: Record<string, string> = {
    POLICE: 'SPECIAL_INSPECT',
    PROTECTOR: 'SPECIAL_PROTECT',
    INFORMER: 'SPECIAL_INFORM',
    CHOR: 'SPECIAL_PLANT_DOUBT',
  };
  if (!role || expectedAction[role] !== d.actionType)
    throw new HttpsError('permission-denied', 'This special action is not available to your role.');
  await roomRef(id)
    .collection('specialActions')
    .doc(playerUid)
    .create({
      actorUid: playerUid,
      actorSeatIndex: m.seatIndex,
      actionType: text(d.actionType, 'actionType', 30),
      targetSeatIndex: d.targetSeatIndex,
      requestId: text(d.requestId, 'requestId'),
      createdAt: FieldValue.serverTimestamp(),
    })
    .catch((e) => {
      if (e.code === 6) throw new HttpsError('already-exists', 'Special action already submitted.');
      throw e;
    });
  return { ok: true };
});
export const submitFinalVote = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId', 'targetSeatIndex']);
  const id = text(d.roomId, 'roomId');
  const m = await member(id, playerUid);
  const room = await roomRef(id).get();
  if (
    room.data()?.currentPhase !== 'FINAL_VOTING' ||
    (room.data()?.phaseEndsAt as Timestamp).toMillis() < Date.now()
  )
    throw new HttpsError('failed-precondition', 'Vote is late or out of phase.');
  if (
    !Number.isInteger(d.targetSeatIndex) ||
    d.targetSeatIndex === m.seatIndex ||
    Number(d.targetSeatIndex) < 0 ||
    Number(d.targetSeatIndex) >= seats
  )
    throw new HttpsError('invalid-argument', 'Invalid vote target.');
  try {
    await roomRef(id)
      .collection('votes')
      .doc(playerUid)
      .create({ targetSeatIndex: d.targetSeatIndex, createdAt: FieldValue.serverTimestamp() });
  } catch (e) {
    throw new HttpsError('already-exists', 'Vote already submitted.');
  }
  return { ok: true };
});

async function privateRoles(id: string) {
  const ref = roomRef(id);
  const [members, humans, bots] = await Promise.all([
    ref.collection('members').orderBy('seatIndex').get(),
    ref.collection('privateState').get(),
    ref.collection('serverPrivateState').get(),
  ]);
  const secrets = new Map([...humans.docs, ...bots.docs].map((secret) => [secret.id, secret.data()]));
  return members.docs.map((member) => ({ ...member.data(), ...secrets.get(member.id) })) as Array<
    ResolutionPlayer & { alias: string }
  >;
}

async function writeBotPhaseActions(id: string, phase: string, round: number) {
  const ref = roomRef(id);
  const players = await privateRoles(id);
  const batch = db.batch();
  const validSeats = players.map((player) => player.seatIndex);
  for (const player of players.filter((candidate) => candidate.isBot)) {
    if (phase === 'INVESTIGATION') {
      const delay = 5_000 + ((player.seatIndex * 11_000 + round * 3_000) % 70_000);
      batch.set(ref.collection('actions').doc(`bot_${round}_${player.seatIndex}`), {
        actorUid: player.uid,
        actorSeatIndex: player.seatIndex,
        actionType: player.role === 'CHOR' ? 'DEFENSE' : 'SUSPICION',
        content:
          player.role === 'CHOR'
            ? 'My timeline is consistent with the public evidence.'
            : 'One account does not fully match the public timeline.',
        publishAt: Timestamp.fromMillis(Date.now() + delay),
        createdAt: FieldValue.serverTimestamp(),
        isBot: true,
      });
    }
    if (phase === 'SPECIAL_ACTIONS' && ['PROTECTOR', 'INFORMER', 'CHOR', 'POLICE'].includes(player.role)) {
      const targetSeatIndex = botVote(`${id}:${round}:special`, player.seatIndex, validSeats);
      batch.set(ref.collection('specialActions').doc(player.uid), {
        actorUid: player.uid,
        actorSeatIndex: player.seatIndex,
        actionType: `SPECIAL_${player.role}`,
        targetSeatIndex,
        isBot: true,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }
  await batch.commit();
}

async function finishMatch(id: string, accusedSeat: number, expectedVersion: number) {
  const ref = roomRef(id);
  const [room, players, specials] = await Promise.all([
    ref.get(),
    privateRoles(id),
    ref.collection('specialActions').get(),
  ]);
  const state = room.data();
  if (!state || state.phaseVersion !== expectedVersion || state.status !== 'IN_GAME')
    throw new HttpsError('aborted', 'Match was already resolved.');
  const specialData = specials.docs.map((item) => item.data());
  const protector = players.find((player) => player.role === 'PROTECTOR');
  const informer = players.find((player) => player.role === 'INFORMER');
  const protectedSeat =
    specialData.find((action) => action.actorUid === protector?.uid)?.targetSeatIndex ?? null;
  const informerTarget =
    specialData.find((action) => action.actorUid === informer?.uid)?.targetSeatIndex ?? null;
  const scoring = calculateScores(players, accusedSeat, protectedSeat, informerTarget);
  const chor = players.find((player) => player.role === 'CHOR')!;
  const matchId = `${id}_${state.round}`;
  const revealDuration = await phaseDuration('REVEAL');
  await db.runTransaction(async (tx) => {
    const humanLines = scoring.lines.filter((item) => !item.isBot);
    const markers = humanLines.map((line) =>
      db.collection('players').doc(line.uid).collection('matchResults').doc(matchId),
    );
    const [latest, ...existingMarkers] = await Promise.all([
      tx.get(ref),
      ...markers.map((marker) => tx.get(marker)),
    ]);
    if (latest.data()?.phaseVersion !== expectedVersion || latest.data()?.status !== 'IN_GAME') return;
    tx.update(ref, {
      status: 'FINISHED',
      currentPhase: 'REVEAL',
      phaseEndsAt: Timestamp.fromMillis(Date.now() + revealDuration * 1000),
      phaseVersion: FieldValue.increment(1),
      protectedSeatIndex: protectedSeat,
      informerTargetSeatIndex: informerTarget,
      accusedSeatIndex: accusedSeat,
      result: {
        winningTeam: scoring.winningTeam,
        chorSeatIndex: chor.seatIndex,
        allRoles: scoring.lines.map((line) => ({
          seatIndex: line.seatIndex,
          role: line.role,
          points: line.points,
          isBot: line.isBot,
        })),
      },
      resolvedMatchId: matchId,
    });
    tx.create(db.collection('matchStats').doc(matchId), {
      caseIndex: state.caseIndex,
      round: state.round,
      winningTeam: scoring.winningTeam,
      humanCount: players.filter((player) => !player.isBot).length,
      botCount: players.filter((player) => player.isBot).length,
      finishedAt: FieldValue.serverTimestamp(),
    });
    for (const [index, line] of humanLines.entries()) {
      const marker = markers[index];
      if (existingMarkers[index].exists) continue;
      tx.create(marker, {
        roomId: id,
        round: state.round,
        role: line.role,
        won: line.won,
        points: line.points,
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.set(
        db.collection('players').doc(line.uid),
        {
          activeRoomId: FieldValue.delete(),
          stats: {
            matchesPlayed: FieldValue.increment(1),
            wins: FieldValue.increment(line.won ? 1 : 0),
            score: FieldValue.increment(line.points),
          },
        },
        { merge: true },
      );
    }
  });
}

async function resolveVoting(id: string, expectedVersion: number, policeChoice?: number) {
  const ref = roomRef(id);
  const [room, players, humanVotes, actions] = await Promise.all([
    ref.get(),
    privateRoles(id),
    ref.collection('votes').get(),
    ref.collection('actions').get(),
  ]);
  const state = room.data();
  if (!state || state.phaseVersion !== expectedVersion)
    throw new HttpsError('aborted', 'Phase already advanced.');
  const votes = humanVotes.docs.map((vote) => Number(vote.data().targetSeatIndex));
  const suspicion = actions.docs.reduce<Record<number, number>>((scores, action) => {
    const data = action.data();
    if (data.actionType === 'SUSPICION' && Number.isInteger(data.targetSeatIndex))
      scores[data.targetSeatIndex] = (scores[data.targetSeatIndex] ?? 0) + 1;
    return scores;
  }, {});
  for (const bot of players.filter((player) => player.isBot)) {
    const target = botVote(
      `${id}:${state.round}`,
      bot.seatIndex,
      players.map((player) => player.seatIndex),
      suspicion,
    );
    votes.push(target);
  }
  const leaders = tiedLeaders(tallyVotes(votes));
  if (!leaders.length)
    leaders.push(
      deterministicTieTarget(
        id,
        state.round,
        players.map((player) => player.seatIndex),
      ),
    );
  if (leaders.length > 1 && policeChoice === undefined) {
    const police = players.find((player) => player.role === 'POLICE');
    if (police && !police.isBot) {
      const tieDuration = await phaseDuration('TIE_BREAK');
      await db.runTransaction(async (tx) => {
        const latest = await tx.get(ref);
        if (latest.data()?.phaseVersion !== expectedVersion) return;
        tx.update(ref, {
          currentPhase: 'TIE_BREAK',
          tiedSeatIndices: leaders,
          policeUid: police.uid,
          phaseEndsAt: Timestamp.fromMillis(Date.now() + tieDuration * 1000),
          phaseVersion: FieldValue.increment(1),
        });
      });
      return;
    }
  }
  const accused =
    policeChoice !== undefined && leaders.includes(policeChoice)
      ? policeChoice
      : leaders.length === 1
        ? leaders[0]
        : deterministicTieTarget(id, state.round, leaders);
  await finishMatch(id, accused, expectedVersion);
}

async function advanceServerPhase(id: string, expectedPhase: string, expectedVersion: number) {
  const before = await roomRef(id).get();
  const beforeState = before.data();
  if (!beforeState || beforeState.status !== 'IN_GAME')
    throw new HttpsError('failed-precondition', 'Match is not active.');
  if (beforeState.currentPhase !== expectedPhase || beforeState.phaseVersion !== expectedVersion)
    throw new HttpsError('aborted', 'Phase already advanced.');
  if ((beforeState.phaseEndsAt as Timestamp).toMillis() > Date.now())
    throw new HttpsError('failed-precondition', 'Phase deadline has not passed.');
  if (beforeState.currentPhase === 'FINAL_VOTING') {
    await resolveVoting(id, expectedVersion);
    return;
  }
  if (beforeState.currentPhase === 'TIE_BREAK') {
    const target = deterministicTieTarget(id, beforeState.round, beforeState.tiedSeatIndices ?? []);
    await finishMatch(id, target, expectedVersion);
    return;
  }
  let nextPhase: (typeof phases)[number] | '' = '';
  let nextDuration = 0;
  let enteredBotPhase: 'INVESTIGATION' | 'SPECIAL_ACTIONS' | null = null;
  await db.runTransaction(async (tx) => {
    const ref = roomRef(id);
    const snap = await tx.get(ref);
    const state = snap.data();
    if (!state || state.status !== 'IN_GAME')
      throw new HttpsError('failed-precondition', 'Match is not active.');
    if (state.currentPhase !== expectedPhase || state.phaseVersion !== expectedVersion)
      throw new HttpsError('aborted', 'Phase already advanced.');
    if ((state.phaseEndsAt as Timestamp).toMillis() > Date.now())
      throw new HttpsError('failed-precondition', 'Phase deadline has not passed.');
    const index = phases.indexOf(state.currentPhase);
    if (index < 0 || phases[index + 1] === 'TIE_BREAK' || phases[index + 1] === 'REVEAL')
      throw new HttpsError('failed-precondition', 'Invalid phase transition.');
    nextPhase = phases[index + 1] as (typeof phases)[number];
    nextDuration = await phaseDuration(nextPhase);
    if (nextPhase === 'INVESTIGATION' || nextPhase === 'SPECIAL_ACTIONS') enteredBotPhase = nextPhase;
    tx.update(ref, {
      currentPhase: nextPhase,
      phaseEndsAt: Timestamp.fromMillis(Date.now() + nextDuration * 1000),
      phaseVersion: FieldValue.increment(1),
    });
  });
  if (enteredBotPhase) await writeBotPhaseActions(id, enteredBotPhase, beforeState.round);
}

export const advanceExpiredPhase = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId', 'expectedPhase', 'expectedVersion']);
  const id = text(d.roomId, 'roomId');
  await member(id, playerUid);
  await advanceServerPhase(id, text(d.expectedPhase, 'expectedPhase'), Number(d.expectedVersion));
  return { ok: true };
});
export const resolveTie = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId', 'targetSeatIndex', 'expectedVersion']);
  const id = text(d.roomId, 'roomId');
  const room = await roomRef(id).get();
  const state = room.data();
  if (state?.currentPhase !== 'TIE_BREAK' || state.policeUid !== playerUid)
    throw new HttpsError('permission-denied', 'Only the assigned Police player may resolve this tie.');
  if ((state.phaseEndsAt as Timestamp).toMillis() < Date.now())
    throw new HttpsError('failed-precondition', 'The tie-break deadline passed.');
  const policeMember = await member(id, playerUid);
  if (Number(d.targetSeatIndex) === policeMember.seatIndex)
    throw new HttpsError('invalid-argument', 'Self-selection is not allowed.');
  if (!state.tiedSeatIndices.includes(d.targetSeatIndex))
    throw new HttpsError('invalid-argument', 'Target is not part of the tie.');
  await finishMatch(id, Number(d.targetSeatIndex), Number(d.expectedVersion));
  return { ok: true };
});
export const resolveMatch = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId', 'expectedVersion']);
  const id = text(d.roomId, 'roomId');
  await member(id, playerUid);
  const room = await roomRef(id).get();
  if (room.data()?.currentPhase !== 'FINAL_VOTING')
    throw new HttpsError('failed-precondition', 'Voting is not ready to resolve.');
  if ((room.data()?.phaseEndsAt as Timestamp).toMillis() > Date.now())
    throw new HttpsError('failed-precondition', 'Voting is still open.');
  await resolveVoting(id, Number(d.expectedVersion));
  return { ok: true };
});
export const requestRematch = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId']);
  const id = text(d.roomId, 'roomId');
  await member(id, playerUid);
  const ref = roomRef(id);
  await ref
    .collection('rematchVotes')
    .doc(playerUid)
    .create({ createdAt: FieldValue.serverTimestamp() })
    .catch(() => undefined);
  const [room, members, rematchVotes] = await Promise.all([
    ref.get(),
    ref.collection('members').orderBy('seatIndex').get(),
    ref.collection('rematchVotes').get(),
  ]);
  if (room.data()?.status !== 'FINISHED')
    throw new HttpsError('failed-precondition', 'The current match has not finished.');
  const humans = members.docs.filter((item) => !item.data().isBot);
  if (rematchVotes.size < humans.length) return { ok: true, waitingFor: humans.length - rematchVotes.size };
  const collections = [
    'actions',
    'votes',
    'specialActions',
    'privateState',
    'serverPrivateState',
    'rematchVotes',
  ];
  const oldDocuments = (await Promise.all(collections.map((name) => ref.collection(name).get()))).flatMap(
    (snapshot) => snapshot.docs,
  );
  const introDuration = await phaseDuration('CASE_INTRO');
  for (let offset = 0; offset < oldDocuments.length; offset += 400) {
    const batch = db.batch();
    oldDocuments.slice(offset, offset + 400).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
  await db.runTransaction(async (tx) => {
    const latest = await tx.get(ref);
    if (latest.data()?.status !== 'FINISHED') return;
    const round = Number(latest.data()?.round ?? 1) + 1;
    const assigned = seededRoles(`${id}:${round}`);
    members.docs.forEach((item, index) => {
      const memberData = item.data();
      const secret = {
        seatIndex: memberData.seatIndex,
        role: assigned[index],
        privateClue: `Case clue ${(((latest.data()?.caseIndex ?? 0) + 1) % 20) + 1}`,
        objective: assigned[index] === 'CHOR' ? 'Avoid the final accusation.' : 'Identify the Chor.',
      };
      tx.set(ref.collection(memberData.isBot ? 'serverPrivateState' : 'privateState').doc(item.id), secret);
    });
    tx.update(ref, {
      status: 'IN_GAME',
      currentPhase: 'CASE_INTRO',
      phaseEndsAt: Timestamp.fromMillis(Date.now() + introDuration * 1000),
      phaseVersion: FieldValue.increment(1),
      round,
      caseIndex: (Number(latest.data()?.caseIndex ?? 0) + 1) % 20,
      protectedSeatIndex: null,
      informerTargetSeatIndex: null,
      accusedSeatIndex: null,
      tiedSeatIndices: FieldValue.delete(),
      policeUid: FieldValue.delete(),
      result: null,
    });
  });
  return { ok: true, restarted: true };
});
export const finalizeQuickMatch = onCall(callable, async (request) => {
  const playerUid = uid(request);
  const d = input(request.data, ['roomId']);
  const id = text(d.roomId, 'roomId');
  const room = await roomRef(id).get();
  if ((room.data()?.humanDeadline as Timestamp).toMillis() > Date.now())
    throw new HttpsError('failed-precondition', 'Still waiting for humans.');
  await start(id, playerUid, true);
  return { ok: true };
});

export const validateEntitlement = onCall(callable, async (request) => {
  const playerUid = uid(request);
  input(request.data, []);
  const snap = await db
    .collection('entitlements')
    .where('userId', '==', playerUid)
    .where('status', '==', 'ACTIVE')
    .get();
  return { valid: snap.docs.some((d) => (d.data().expiresAt as Timestamp).toMillis() > Date.now()) };
});
export const createRazorpayOrder = onCall(
  { ...callable, secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'] },
  async (request) => {
    const playerUid = uid(request);
    input(request.data, ['productId']);
    if (request.data.productId !== HOST_PASS.productId)
      throw new HttpsError('invalid-argument', 'Unknown product.');
    const key = process.env.RAZORPAY_KEY_ID,
      secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) throw new HttpsError('failed-precondition', 'Purchasing is unavailable.');
    const receipt = `host_${Date.now()}_${playerUid.slice(0, 6)}`;
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: HOST_PASS.amount, currency: HOST_PASS.currency, receipt }),
    });
    if (!response.ok) throw new HttpsError('unavailable', 'Payment provider unavailable.');
    const order = (await response.json()) as { id: string; amount: number; currency: string };
    await db.collection('paymentOrders').doc(order.id).create({
      userId: playerUid,
      productId: HOST_PASS.productId,
      amount: HOST_PASS.amount,
      currency: HOST_PASS.currency,
      status: 'CREATED',
      createdAt: FieldValue.serverTimestamp(),
    });
    return { orderId: order.id, amount: HOST_PASS.amount, currency: HOST_PASS.currency, keyId: key };
  },
);
export const verifyRazorpayPayment = onCall(
  { ...callable, secrets: ['RAZORPAY_KEY_SECRET'] },
  async (request) => {
    const playerUid = uid(request);
    const d = input(request.data, ['orderId', 'paymentId', 'signature']);
    const orderId = text(d.orderId, 'orderId'),
      paymentId = text(d.paymentId, 'paymentId'),
      signature = text(d.signature, 'signature');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new HttpsError('failed-precondition', 'Payment verification unavailable.');
    const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    if (
      expected.length !== signature.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    )
      throw new HttpsError('permission-denied', 'Invalid payment signature.');
    await db.runTransaction(async (tx) => {
      const orderRef = db.collection('paymentOrders').doc(orderId),
        order = await tx.get(orderRef);
      if (!paymentMatchesOrder(order.data() as never, playerUid))
        throw new HttpsError('permission-denied', 'Payment does not match this account.');
      if (order.data()?.status === 'CAPTURED') return;
      tx.update(orderRef, { status: 'VERIFIED', paymentId, verifiedAt: FieldValue.serverTimestamp() });
    });
    return { verified: true, pendingCapture: true };
  },
);

export const processRazorpayWebhook = onRequest(
  { secrets: ['RAZORPAY_WEBHOOK_SECRET'] },
  async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.header('x-razorpay-signature');
    if (!secret || !signature) {
      res.status(401).send('Signature required');
      return;
    }
    const expected = createHmac('sha256', secret).update(req.rawBody).digest('hex');
    if (
      expected.length !== signature.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      res.status(401).send('Invalid signature');
      return;
    }
    const payment = req.body?.payload?.payment?.entity;
    if (req.body?.event !== 'payment.captured' || !payment?.id) {
      res.status(200).send('Ignored');
      return;
    }
    await db.runTransaction(async (tx) => {
      const paymentRef = db.collection('payments').doc(payment.id);
      if ((await tx.get(paymentRef)).exists) return;
      const orderRef = db.collection('paymentOrders').doc(payment.order_id),
        order = await tx.get(orderRef);
      if (
        !order.exists ||
        order.data()?.amount !== payment.amount ||
        order.data()?.currency !== payment.currency
      )
        return;
      tx.create(paymentRef, {
        orderId: payment.order_id,
        userId: order.data()?.userId,
        amount: payment.amount,
        currency: payment.currency,
        status: 'CAPTURED',
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.update(orderRef, { status: 'CAPTURED' });
      tx.create(db.collection('entitlements').doc(paymentEntitlementId(payment.id)), {
        userId: order.data()?.userId,
        type: 'TWO_HOUR_HOST_PASS',
        status: 'ACTIVE',
        paymentId: payment.id,
        orderId: payment.order_id,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 7_200_000),
      });
    });
    res.status(200).send('Accepted');
  },
);

export const publishCase = onCall(callable, async (request) => {
  uid(request);
  if (request.auth?.token.admin !== true)
    throw new HttpsError('permission-denied', 'Administrator claim required.');
  const d = input(request.data, ['caseId', 'caseData']);
  const id = text(d.caseId, 'caseId');
  if (!d.caseData || typeof d.caseData !== 'object' || Array.isArray(d.caseData))
    throw new HttpsError('invalid-argument', 'Case data required.');
  const caseData = d.caseData as Data;
  if (
    typeof caseData.title !== 'string' ||
    typeof caseData.intro !== 'string' ||
    !Array.isArray(caseData.publicEvidence) ||
    caseData.publicEvidence.length < 2 ||
    !caseData.roleClues ||
    typeof caseData.roleClues !== 'object' ||
    typeof caseData.correctReasoning !== 'string'
  )
    throw new HttpsError('invalid-argument', 'Case failed server validation.');
  await db
    .collection('cases')
    .doc(id)
    .set({ ...caseData, id, enabled: true, updatedAt: FieldValue.serverTimestamp() });
  return { ok: true };
});
export const disableCase = onCall(callable, async (request) => {
  uid(request);
  if (request.auth?.token.admin !== true)
    throw new HttpsError('permission-denied', 'Administrator claim required.');
  const d = input(request.data, ['caseId']);
  await db
    .collection('cases')
    .doc(text(d.caseId, 'caseId'))
    .update({ enabled: false, updatedAt: FieldValue.serverTimestamp() });
  return { ok: true };
});
export const updateSystemConfig = onCall(callable, async (request) => {
  uid(request);
  if (request.auth?.token.admin !== true)
    throw new HttpsError('permission-denied', 'Administrator claim required.');
  const d = input(request.data, ['maintenance', 'phaseDurations']);
  if (typeof d.maintenance !== 'boolean' || !d.phaseDurations || typeof d.phaseDurations !== 'object')
    throw new HttpsError('invalid-argument', 'Invalid system configuration.');
  const durations = d.phaseDurations as Record<string, unknown>;
  if (
    Object.keys(durations).some(
      (key) =>
        !phases.includes(key as (typeof phases)[number]) ||
        !Number.isInteger(durations[key]) ||
        Number(durations[key]) < 10 ||
        Number(durations[key]) > 300,
    )
  )
    throw new HttpsError('invalid-argument', 'Phase durations must be whole seconds between 10 and 300.');
  await db.collection('systemConfig').doc('gameplay').set(
    {
      maintenance: d.maintenance,
      phaseDurations: durations,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid,
    },
    { merge: true },
  );
  return { ok: true };
});
export const expireStaleRooms = onSchedule('every 15 minutes', async () => {
  const cutoff = Timestamp.fromMillis(Date.now() - 24 * 60 * 60_000);
  const stale = await db
    .collection('rooms')
    .where('createdAt', '<', cutoff)
    .where('status', 'in', ['LOBBY', 'FINISHED'])
    .get();
  const batch = db.batch();
  stale.docs.forEach((doc) => batch.update(doc.ref, { status: 'EXPIRED', matchmakingOpen: false }));
  await batch.commit();
});
export const advanceExpiredMatches = onSchedule('every 1 minutes', async () => {
  const expired = await db
    .collection('rooms')
    .where('status', '==', 'IN_GAME')
    .where('phaseEndsAt', '<=', Timestamp.now())
    .limit(100)
    .get();
  await Promise.all(
    expired.docs.map((room) =>
      advanceServerPhase(room.id, room.data().currentPhase, room.data().phaseVersion).catch((error) => {
        if (!(error instanceof HttpsError) || error.code !== 'aborted') throw error;
      }),
    ),
  );
});
