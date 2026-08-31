import { collection, doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { GamePhase, PrivatePlayerState, RoomPolicy, StructuredActionType } from '../types';

export interface RoomMember {
  uid: string;
  alias: string;
  seatIndex: number;
  isBot: boolean;
  isReady: boolean;
  botPersonality?: string;
}
export interface PublicAction {
  id: string;
  actorSeatIndex: number;
  actionType: string;
  content: string;
  targetSeatIndex?: number;
  publishAt?: { toMillis(): number };
}
export interface RoomView {
  id: string;
  code: string;
  hostUid: string;
  isPrivate: boolean;
  policy: RoomPolicy;
  status: 'LOBBY' | 'IN_GAME' | 'FINISHED' | 'EXPIRED';
  occupancy: number;
  currentPhase?: GamePhase;
  phaseEndsAt?: { toMillis(): number };
  phaseVersion: number;
  round?: number;
  caseIndex?: number;
  invitePriorityEndsAt?: { toMillis(): number };
  publicAt?: { toMillis(): number };
  botFillAt?: { toMillis(): number };
  humanDeadline?: { toMillis(): number };
  tiedSeatIndices?: number[];
  policeUid?: string;
  result?: {
    winningTeam: 'POLICE_SIDE' | 'CHOR_SIDE';
    chorSeatIndex: number;
    allRoles: Array<{ seatIndex: number; role: string; points: number; isBot: boolean }>;
  } | null;
  members: RoomMember[];
  actions: PublicAction[];
}

const call = <TInput, TOutput>(name: string) => httpsCallable<TInput, TOutput>(functions, name);
export const multiplayer = {
  quickMatch: (alias: string) => call<{ alias: string }, { roomId: string }>('requestQuickMatch')({ alias }),
  createPrivate: (alias: string, policy: RoomPolicy) =>
    call<{ alias: string; policy: RoomPolicy }, { roomId: string; code: string }>('createPrivateRoom')({
      alias,
      policy,
    }),
  join: (alias: string, code: string) =>
    call<{ alias: string; code: string }, { roomId: string }>('joinRoomByCode')({
      alias,
      code: code.trim().toUpperCase(),
    }),
  leave: (roomId: string) => call('leaveLobby')({ roomId }),
  ready: (roomId: string, ready: boolean) => call('toggleReady')({ roomId, ready }),
  policy: (roomId: string, policy: RoomPolicy) => call('updateRoomPolicy')({ roomId, policy }),
  start: (roomId: string) => call('startMatch')({ roomId }),
  fillBots: (roomId: string) => call('fillBots')({ roomId }),
  action: (roomId: string, actionType: StructuredActionType, content: string, targetSeatIndex?: number) =>
    call('submitStructuredAction')({
      roomId,
      actionType,
      content,
      targetSeatIndex,
      requestId: crypto.randomUUID(),
    }),
  special: (roomId: string, actionType: string, targetSeatIndex: number) =>
    call('submitSpecialAction')({ roomId, actionType, targetSeatIndex, requestId: crypto.randomUUID() }),
  vote: (roomId: string, targetSeatIndex: number) => call('submitFinalVote')({ roomId, targetSeatIndex }),
  advance: (roomId: string, expectedPhase: string, expectedVersion: number) =>
    call('advanceExpiredPhase')({ roomId, expectedPhase, expectedVersion }),
  resolveTie: (roomId: string, targetSeatIndex: number, expectedVersion: number) =>
    call('resolveTie')({ roomId, targetSeatIndex, expectedVersion }),
  rematch: (roomId: string) => call('requestRematch')({ roomId }),
};

export function subscribeToRoom(
  roomId: string,
  uid: string,
  update: (room: RoomView | null) => void,
  failure: (error: Error) => void,
): Unsubscribe {
  let roomData: Omit<RoomView, 'members' | 'actions'> | null = null;
  let members: RoomMember[] = [];
  let actions: PublicAction[] = [];
  const emit = () => update(roomData ? { ...roomData, members, actions } : null);
  const stops: Unsubscribe[] = [];
  stops.push(
    onSnapshot(
      doc(db, 'rooms', roomId, 'members', uid),
      (member) => {
        if (!member.exists()) {
          update(null);
          return;
        }
        if (stops.length > 1) return;
        stops.push(
          onSnapshot(
            doc(db, 'rooms', roomId),
            (snapshot) => {
              roomData = snapshot.exists()
                ? ({ id: snapshot.id, ...snapshot.data() } as Omit<RoomView, 'members' | 'actions'>)
                : null;
              emit();
            },
            failure,
          ),
        );
        stops.push(
          onSnapshot(
            collection(db, 'rooms', roomId, 'members'),
            (snapshot) => {
              members = snapshot.docs
                .map((item) => item.data() as RoomMember)
                .sort((a, b) => a.seatIndex - b.seatIndex);
              emit();
            },
            failure,
          ),
        );
        stops.push(
          onSnapshot(
            collection(db, 'rooms', roomId, 'actions'),
            (snapshot) => {
              actions = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as PublicAction);
              emit();
            },
            failure,
          ),
        );
      },
      failure,
    ),
  );
  return () => stops.forEach((stop) => stop());
}

export function subscribeToPrivateState(
  roomId: string,
  uid: string,
  update: (state: PrivatePlayerState | null) => void,
  failure: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'rooms', roomId, 'privateState', uid),
    (snapshot) => update(snapshot.exists() ? (snapshot.data() as PrivatePlayerState) : null),
    failure,
  );
}

export function subscribeToActiveRoom(
  uid: string,
  update: (roomId: string | null) => void,
  failure: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, 'players', uid),
    (snapshot) => update((snapshot.data()?.activeRoomId as string | undefined) ?? null),
    failure,
  );
}
