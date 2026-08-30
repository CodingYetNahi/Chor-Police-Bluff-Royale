import {
  Case,
  GamePhase,
  GameResult,
  PrivatePlayerState,
  Role,
  Room,
  RoomPolicy,
  Seat,
  StructuredActionType,
  ActionLog
} from '../types';
import { SEED_CASES } from '../content/cases';
import {
  BOT_NAMES,
  createBotState,
  determineBotProtection,
  determineBotVote,
  generateBotInvestigationAction,
  SeededRandom,
  updateBotSuspicion,
  BotState
} from '../features/bots/botEngine';

export class GameEngine {
  private static instance: GameEngine;
  private activeRooms: Map<string, Room> = new Map();
  private privateStates: Map<string, Map<string, PrivatePlayerState>> = new Map(); // roomId -> (uid -> PrivateState)
  private botStates: Map<string, Map<number, BotState>> = new Map(); // roomId -> (seatIndex -> BotState)
  private matchRngs: Map<string, SeededRandom> = new Map();

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  /**
   * Generates a unique 6-character uppercase room code.
   */
  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Creates a private room.
   */
  public createPrivateRoom(hostUid: string, hostAlias: string, policy: RoomPolicy = 'FILL_WITH_BOTS'): Room {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const code = this.generateRoomCode();
    const now = Date.now();

    const hostSeat: Seat = {
      seatIndex: 0,
      uid: hostUid,
      alias: hostAlias,
      isBot: false,
      isReady: true,
      isHost: true,
      isProtected: false,
      suspectVotedFor: null,
      scoreEarned: 0,
      specialActionUsed: false,
      connected: true
    };

    const emptySeats: Seat[] = [hostSeat];
    for (let i = 1; i < 6; i++) {
      emptySeats.push({
        seatIndex: i,
        uid: '',
        alias: `Seat ${i + 1}`,
        isBot: false,
        isReady: false,
        isHost: false,
        isProtected: false,
        suspectVotedFor: null,
        scoreEarned: 0,
        specialActionUsed: false,
        connected: false
      });
    }

    const room: Room = {
      id: roomId,
      code,
      hostUid,
      isPrivate: true,
      policy,
      status: 'LOBBY',
      caseId: SEED_CASES[0].id,
      currentPhase: 'CASE_INTRO',
      phaseEndsAt: 0,
      seats: emptySeats,
      actionLogs: [],
      specialActionResolutions: {},
      tieBreaker: null,
      result: null,
      createdAt: now,
      expiresAt: now + 4 * 60 * 60 * 1000 // 4 hours
    };

    this.activeRooms.set(roomId, room);
    return room;
  }

  /**
   * Joins an existing room by 6-char code.
   */
  public joinRoomByCode(code: string, uid: string, alias: string): { success: boolean; room?: Room; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const room = Array.from(this.activeRooms.values()).find((r) => r.code === cleanCode);

    if (!room) {
      return { success: false, error: 'Room not found. Please check your room code.' };
    }

    if (room.status !== 'LOBBY') {
      // If player is already part of this match, allow reconnection
      const existingSeat = room.seats.find((s) => s.uid === uid);
      if (existingSeat) {
        existingSeat.connected = true;
        return { success: true, room };
      }
      return { success: false, error: 'Match has already started.' };
    }

    // Check if player is already seated
    const existingIndex = room.seats.findIndex((s) => s.uid === uid);
    if (existingIndex !== -1) {
      room.seats[existingIndex].alias = alias;
      room.seats[existingIndex].connected = true;
      return { success: true, room };
    }

    // Find first empty seat
    const emptySeat = room.seats.find((s) => !s.uid && !s.isBot);
    if (!emptySeat) {
      return { success: false, error: 'Room is full (6/6 seats occupied).' };
    }

    emptySeat.uid = uid;
    emptySeat.alias = alias;
    emptySeat.isReady = false;
    emptySeat.isBot = false;
    emptySeat.connected = true;

    return { success: true, room };
  }

  /**
   * Updates host room policy in lobby.
   */
  public updateRoomPolicy(roomId: string, hostUid: string, policy: RoomPolicy): boolean {
    const room = this.activeRooms.get(roomId);
    if (!room || room.hostUid !== hostUid || room.status !== 'LOBBY') return false;
    room.policy = policy;
    return true;
  }

  /**
   * Quick Match: joins an available public room or creates one.
   */
  public requestQuickMatch(uid: string, alias: string): Room {
    // Find active public lobby with empty seats
    let room = Array.from(this.activeRooms.values()).find(
      (r) => !r.isPrivate && r.status === 'LOBBY' && r.seats.some((s) => !s.uid)
    );

    if (!room) {
      // Create new public room
      const roomId = `qm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const seats: Seat[] = [];

      for (let i = 0; i < 6; i++) {
        seats.push({
          seatIndex: i,
          uid: i === 0 ? uid : '',
          alias: i === 0 ? alias : `Seat ${i + 1}`,
          isBot: false,
          isReady: i === 0,
          isHost: i === 0,
          isProtected: false,
          suspectVotedFor: null,
          scoreEarned: 0,
          specialActionUsed: false,
          connected: i === 0
        });
      }

      room = {
        id: roomId,
        code: this.generateRoomCode(),
        hostUid: uid,
        isPrivate: false,
        policy: 'FILL_WITH_BOTS',
        status: 'LOBBY',
        caseId: SEED_CASES[0].id,
        currentPhase: 'CASE_INTRO',
        phaseEndsAt: 0,
        seats,
        actionLogs: [],
        specialActionResolutions: {},
        tieBreaker: null,
        result: null,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000
      };

      this.activeRooms.set(roomId, room);
    } else {
      // Join first empty seat
      const emptySeat = room.seats.find((s) => !s.uid);
      if (emptySeat) {
        emptySeat.uid = uid;
        emptySeat.alias = alias;
        emptySeat.isReady = true;
        emptySeat.connected = true;
      }
    }

    return room;
  }

  /**
   * Starts a match once seats are ready or fills with bots based on policy.
   */
  public startMatch(roomId: string, forceWithBots: boolean = true): { success: boolean; room?: Room; error?: string } {
    const room = this.activeRooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found.' };

    const humanCount = room.seats.filter((s) => s.uid && !s.isBot).length;

    if (room.policy === 'HUMANS_ONLY' && humanCount < 6) {
      return { success: false, error: 'All 6 human players must be seated and ready for Humans Only policy.' };
    }

    // Fill remaining seats with disclosed bots
    const usedBotNames = new Set<string>();
    const rng = new SeededRandom(Date.now());
    this.matchRngs.set(roomId, rng);

    room.seats.forEach((seat, idx) => {
      if (!seat.uid) {
        let name = rng.choice(BOT_NAMES);
        while (usedBotNames.has(name)) {
          name = rng.choice(BOT_NAMES);
        }
        usedBotNames.add(name);

        seat.uid = `bot_${roomId}_${idx}`;
        seat.alias = name;
        seat.isBot = true;
        seat.botPersonality = rng.choice([
          'EVIDENCE_FOCUSED',
          'CONFIDENT_ACCUSER',
          'QUIET_OBSERVER',
          'NERVOUS_DEFENDER',
          'EASILY_PERSUADED',
          'STRATEGIC_BLUFFER'
        ]);
        seat.isReady = true;
        seat.connected = true;
      }
    });

    // Select random case from pool
    const activeCase = rng.choice(SEED_CASES.filter((c) => c.enabled));
    room.caseId = activeCase.id;
    room.caseData = activeCase;

    // Assign roles securely server-side
    // Exactly 6 roles: 1 Chor, 1 Police, 1 Informer, 1 Protector, 2 Citizens
    const rolePool: Role[] = ['CHOR', 'POLICE', 'INFORMER', 'PROTECTOR', 'CITIZEN', 'CITIZEN'];
    // Fisher-Yates shuffle
    for (let i = rolePool.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [rolePool[i], rolePool[j]] = [rolePool[j], rolePool[i]];
    }

    const roomPrivateMap = new Map<string, PrivatePlayerState>();
    const roomBotMap = new Map<number, BotState>();

    let citizenClueIndex = 0;

    room.seats.forEach((seat, idx) => {
      const assignedRole = rolePool[idx];
      let clue = '';
      let objective = '';
      let roleTitle = '';
      let specialActionName = '';
      let specialActionDesc = '';

      switch (assignedRole) {
        case 'CHOR':
          clue = activeCase.roleClues.chorCoverClue;
          objective = 'Blend in, avoid the highest vote, and mislead the group to win.';
          roleTitle = 'Chor (Mastermind)';
          specialActionName = 'Plant Doubt';
          specialActionDesc = 'Introduce a subtle ambiguous statement into public records.';
          break;
        case 'POLICE':
          clue = activeCase.roleClues.policeVerifiedClue;
          objective = 'Analyze evidence, inspect leads, and lead the charge to unmask the Chor.';
          roleTitle = 'Police (Inspector)';
          specialActionName = 'Inspect Evidence';
          specialActionDesc = 'Examine deep forensic context on one public evidence item.';
          break;
        case 'INFORMER':
          clue = activeCase.roleClues.informerSecretClue;
          objective = 'Guide the citizens with secret eyewitness clues without being accused.';
          roleTitle = 'Informer (Secret Eye)';
          specialActionName = 'Eyewitness Bonus';
          specialActionDesc = 'Receive bonus points if the Chor is caught and you remain trusted.';
          break;
        case 'PROTECTOR':
          clue = activeCase.roleClues.protectorDefenseClue;
          objective = 'Shield an innocent player from elimination before final voting.';
          roleTitle = 'Protector (Guardian)';
          specialActionName = 'Shield Player';
          specialActionDesc = 'Protect one suspect. Has no effect if applied to the Chor.';
          break;
        case 'CITIZEN':
          clue = activeCase.roleClues.citizenClues[citizenClueIndex % activeCase.roleClues.citizenClues.length];
          citizenClueIndex++;
          objective = 'Compare statements, spot contradictions, and vote for the suspected Chor.';
          roleTitle = 'Citizen (Investigator)';
          specialActionName = 'Verify Clues';
          specialActionDesc = 'Cross-examine witness statements against timeline evidence.';
          break;
      }

      const pState: PrivatePlayerState = {
        seatIndex: idx,
        role: assignedRole,
        objective,
        privateClue: clue,
        roleTitle,
        specialActionName,
        specialActionDescription: specialActionDesc,
        hasAcknowledgedRole: false
      };

      roomPrivateMap.set(seat.uid, pState);

      if (seat.isBot && seat.botPersonality) {
        const bState = createBotState(idx, assignedRole, seat.botPersonality, clue);
        roomBotMap.set(idx, bState);
      }
    });

    this.privateStates.set(roomId, roomPrivateMap);
    this.botStates.set(roomId, roomBotMap);

    room.status = 'IN_GAME';
    room.currentPhase = 'CASE_INTRO';
    room.phaseEndsAt = Date.now() + 12000; // 12 seconds
    room.actionLogs = [
      {
        id: `log_init_${Date.now()}`,
        timestamp: Date.now(),
        actorSeatIndex: -1,
        actorAlias: 'System',
        actionType: 'STATEMENT',
        content: `Case initialized: "${activeCase.title}". The incident occurred at ${activeCase.location}.`
      }
    ];

    return { success: true, room };
  }

  /**
   * Retrieves room data.
   */
  public getRoom(roomId: string): Room | null {
    return this.activeRooms.get(roomId) || null;
  }

  /**
   * Retrieves private state for a specific user.
   * Enforces strict secrecy: only the calling UID's state is returned.
   */
  public getPrivateState(roomId: string, uid: string): PrivatePlayerState | null {
    const roomMap = this.privateStates.get(roomId);
    if (!roomMap) return null;
    return roomMap.get(uid) || null;
  }

  /**
   * Acknowledges role card.
   */
  public acknowledgeRole(roomId: string, uid: string): boolean {
    const pState = this.getPrivateState(roomId, uid);
    if (pState) {
      pState.hasAcknowledgedRole = true;
      return true;
    }
    return false;
  }

  /**
   * Transitions match to next phase server-authoritatively.
   */
  public advancePhase(roomId: string): Room | null {
    const room = this.activeRooms.get(roomId);
    if (!room || room.status !== 'IN_GAME') return null;

    const now = Date.now();
    const activeCase = room.caseData || SEED_CASES.find((c) => c.id === room.caseId)!;
    const rng = this.matchRngs.get(roomId) || new SeededRandom();

    switch (room.currentPhase) {
      case 'CASE_INTRO':
        room.currentPhase = 'SECRET_ROLE';
        room.phaseEndsAt = now + 15000; // 15s
        break;

      case 'SECRET_ROLE':
        room.currentPhase = 'EVIDENCE_REVIEW';
        room.phaseEndsAt = now + 30000; // 30s
        break;

      case 'EVIDENCE_REVIEW':
        room.currentPhase = 'INVESTIGATION';
        room.phaseEndsAt = now + 60000; // 60s
        // Trigger automated initial bot actions during investigation
        this.triggerBotInvestigationRounds(roomId, activeCase, rng);
        break;

      case 'INVESTIGATION':
        room.currentPhase = 'SPECIAL_ACTIONS';
        room.phaseEndsAt = now + 15000; // 15s
        // Trigger bot special actions
        this.triggerBotSpecialActions(roomId, activeCase, rng);
        break;

      case 'SPECIAL_ACTIONS':
        room.currentPhase = 'FINAL_VOTING';
        room.phaseEndsAt = now + 20000; // 20s
        // Bots cast votes
        this.triggerBotVotes(roomId, rng);
        break;

      case 'FINAL_VOTING':
        this.resolveMatchResult(room, activeCase);
        room.currentPhase = 'REVEAL';
        room.phaseEndsAt = now + 15000; // 15s
        break;

      case 'REVEAL':
        room.currentPhase = 'REMATCH';
        room.phaseEndsAt = now + 60000;
        break;

      case 'REMATCH':
        break;
    }

    return room;
  }

  /**
   * Submits a structured investigation action from a human player.
   */
  public submitStructuredAction(
    roomId: string,
    uid: string,
    action: {
      actionType: StructuredActionType;
      content: string;
      targetSeatIndex?: number;
      emoji?: string;
    }
  ): { success: boolean; error?: string } {
    const room = this.activeRooms.get(roomId);
    if (!room || room.status !== 'IN_GAME' || room.currentPhase !== 'INVESTIGATION') {
      return { success: false, error: 'Investigation actions can only be submitted during Phase 4.' };
    }

    const seat = room.seats.find((s) => s.uid === uid);
    if (!seat) return { success: false, error: 'Player seat not found in room.' };

    const targetSeat = action.targetSeatIndex !== undefined ? room.seats[action.targetSeatIndex] : undefined;

    const log: ActionLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      actorSeatIndex: seat.seatIndex,
      actorAlias: seat.alias,
      targetSeatIndex: action.targetSeatIndex,
      targetAlias: targetSeat ? targetSeat.alias : undefined,
      actionType: action.actionType,
      content: action.content,
      emoji: action.emoji
    };

    room.actionLogs.push(log);

    // Update bot suspicion based on this human action
    const botMap = this.botStates.get(roomId);
    const activeCase = room.caseData || SEED_CASES[0];
    if (botMap) {
      botMap.forEach((bState, seatIdx) => {
        const updated = updateBotSuspicion(bState, [log], activeCase);
        botMap.set(seatIdx, updated);
      });
    }

    return { success: true };
  }

  /**
   * Submits a special action during Phase 5 (Police Inspect, Protector Shield, Chor Plant Doubt).
   */
  public submitSpecialAction(
    roomId: string,
    uid: string,
    action: {
      evidenceIdToInspect?: string;
      seatIndexToProtect?: number;
      doubtTextToPlant?: string;
    }
  ): { success: boolean; resultMessage?: string; error?: string } {
    const room = this.activeRooms.get(roomId);
    if (!room || room.status !== 'IN_GAME' || room.currentPhase !== 'SPECIAL_ACTIONS') {
      return { success: false, error: 'Special actions can only be used during Phase 5.' };
    }

    const pState = this.getPrivateState(roomId, uid);
    const seat = room.seats.find((s) => s.uid === uid);
    if (!pState || !seat) return { success: false, error: 'Player state not found.' };

    if (seat.specialActionUsed) {
      return { success: false, error: 'You have already used your special action for this match.' };
    }

    const activeCase = room.caseData || SEED_CASES[0];

    if (pState.role === 'POLICE' && action.evidenceIdToInspect) {
      const ev = activeCase.publicEvidence.find((e) => e.id === action.evidenceIdToInspect);
      if (!ev) return { success: false, error: 'Evidence item not found.' };

      const detail = ev.inspectedDetail || 'Forensic analysis confirmed alignment with timeline records.';
      pState.specialActionFeedback = `Forensic Inspection Result: ${detail}`;
      seat.specialActionUsed = true;
      room.specialActionResolutions.policeInspectedEvidenceId = action.evidenceIdToInspect;
      room.specialActionResolutions.policeInspectionResult = detail;

      return { success: true, resultMessage: detail };
    }

    if (pState.role === 'PROTECTOR' && action.seatIndexToProtect !== undefined) {
      const targetSeat = room.seats[action.seatIndexToProtect];
      if (!targetSeat) return { success: false, error: 'Invalid player target to protect.' };

      // Protection shields innocent player
      const privateMap = this.privateStates.get(roomId);
      const targetPState = privateMap?.get(targetSeat.uid);

      if (targetPState && targetPState.role !== 'CHOR') {
        targetSeat.isProtected = true;
      }
      seat.specialActionUsed = true;
      room.specialActionResolutions.protectorTargetSeatIndex = action.seatIndexToProtect;
      pState.specialActionFeedback = `You placed guardian protection on ${targetSeat.alias}.`;

      return { success: true, resultMessage: `Protection activated on ${targetSeat.alias}.` };
    }

    if (pState.role === 'CHOR' && action.doubtTextToPlant) {
      seat.specialActionUsed = true;
      room.specialActionResolutions.chorPlantedDoubt = action.doubtTextToPlant;
      pState.specialActionFeedback = `Planted doubt: "${action.doubtTextToPlant}" added to public investigation log.`;

      room.actionLogs.push({
        id: `log_doubt_${Date.now()}`,
        timestamp: Date.now(),
        actorSeatIndex: seat.seatIndex,
        actorAlias: 'Anonymous Lead',
        actionType: 'SPECIAL_PLANT_DOUBT',
        content: `Unverified tip received: ${action.doubtTextToPlant}`
      });

      return { success: true, resultMessage: 'Doubt planted successfully.' };
    }

    return { success: false, error: 'No valid special action provided.' };
  }

  /**
   * Submits a final vote during Phase 6.
   */
  public submitFinalVote(roomId: string, uid: string, targetSeatIndex: number): { success: boolean; error?: string } {
    const room = this.activeRooms.get(roomId);
    if (!room || room.status !== 'IN_GAME' || room.currentPhase !== 'FINAL_VOTING') {
      return { success: false, error: 'Votes can only be cast during Phase 6.' };
    }

    const seat = room.seats.find((s) => s.uid === uid);
    if (!seat) return { success: false, error: 'Player seat not found.' };

    if (seat.suspectVotedFor !== null) {
      return { success: false, error: 'You have already submitted your final vote.' };
    }

    if (targetSeatIndex === seat.seatIndex) {
      return { success: false, error: 'Self-voting is not allowed in this case.' };
    }

    seat.suspectVotedFor = targetSeatIndex;
    return { success: true };
  }

  /**
   * Resolves Police tie-break decision if applicable.
   */
  public resolvePoliceTieBreak(roomId: string, policeUid: string, chosenSeatIndex: number): boolean {
    const room = this.activeRooms.get(roomId);
    if (!room || !room.tieBreaker || !room.tieBreaker.inTie) return false;

    const pState = this.getPrivateState(roomId, policeUid);
    if (!pState || pState.role !== 'POLICE') return false;

    room.tieBreaker.policeDecisionSeatIndex = chosenSeatIndex;
    return true;
  }

  private triggerBotInvestigationRounds(roomId: string, activeCase: Case, rng: SeededRandom) {
    const room = this.activeRooms.get(roomId);
    const botMap = this.botStates.get(roomId);
    if (!room || !botMap) return;

    // Have 2-3 bots perform investigation actions
    const botSeats = room.seats.filter((s) => s.isBot);
    botSeats.forEach((seat) => {
      const bState = botMap.get(seat.seatIndex);
      if (!bState) return;

      const act = generateBotInvestigationAction(bState, room.seats, activeCase, rng);
      const log: ActionLog = {
        id: `bot_log_${Date.now()}_${seat.seatIndex}`,
        timestamp: Date.now() + rng.nextInt(2000, 25000),
        actorSeatIndex: seat.seatIndex,
        actorAlias: seat.alias,
        targetSeatIndex: act.targetSeatIndex,
        targetAlias: act.targetAlias,
        actionType: act.actionType,
        content: act.content,
        emoji: act.emoji
      };
      room.actionLogs.push(log);
    });

    // Re-evaluate suspicion after logs
    botMap.forEach((bState, idx) => {
      const updated = updateBotSuspicion(bState, room.actionLogs, activeCase);
      botMap.set(idx, updated);
    });
  }

  private triggerBotSpecialActions(roomId: string, activeCase: Case, rng: SeededRandom) {
    const room = this.activeRooms.get(roomId);
    const botMap = this.botStates.get(roomId);
    if (!room || !botMap) return;

    room.seats
      .filter((s) => s.isBot)
      .forEach((seat) => {
        const bState = botMap.get(seat.seatIndex);
        if (!bState) return;

        if (bState.role === 'PROTECTOR') {
          const protectTarget = determineBotProtection(bState, room.seats, rng);
          const targetSeat = room.seats[protectTarget];
          const privateMap = this.privateStates.get(roomId);
          const targetPState = privateMap?.get(targetSeat?.uid);

          if (targetPState && targetPState.role !== 'CHOR' && targetSeat) {
            targetSeat.isProtected = true;
          }
          seat.specialActionUsed = true;
        } else if (bState.role === 'CHOR') {
          const doubt = rng.choice(activeCase.plantDoubtOptions);
          room.actionLogs.push({
            id: `doubt_bot_${Date.now()}`,
            timestamp: Date.now() + 5000,
            actorSeatIndex: seat.seatIndex,
            actorAlias: 'Anonymous Lead',
            actionType: 'SPECIAL_PLANT_DOUBT',
            content: `Unverified tip received: ${doubt.text}`
          });
          seat.specialActionUsed = true;
        } else if (bState.role === 'POLICE') {
          seat.specialActionUsed = true;
        }
      });
  }

  private triggerBotVotes(roomId: string, rng: SeededRandom) {
    const room = this.activeRooms.get(roomId);
    const botMap = this.botStates.get(roomId);
    if (!room || !botMap) return;

    room.seats
      .filter((s) => s.isBot)
      .forEach((seat) => {
        if (seat.suspectVotedFor === null) {
          const bState = botMap.get(seat.seatIndex);
          if (bState) {
            seat.suspectVotedFor = determineBotVote(bState, room.seats, rng);
          } else {
            // fallback
            const otherSeats = room.seats.filter((s) => s.seatIndex !== seat.seatIndex);
            seat.suspectVotedFor = rng.choice(otherSeats).seatIndex;
          }
        }
      });
  }

  /**
   * Computes final scoring and match results server-authoritatively.
   */
  private resolveMatchResult(room: Room, activeCase: Case) {
    const privateMap = this.privateStates.get(room.id);
    if (!privateMap) return;

    // 1. Tally votes
    const voteSummary: { [seatIndex: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    room.seats.forEach((seat) => {
      if (seat.suspectVotedFor !== null && seat.suspectVotedFor >= 0 && seat.suspectVotedFor < 6) {
        voteSummary[seat.suspectVotedFor] = (voteSummary[seat.suspectVotedFor] || 0) + 1;
      }
    });

    // 2. Identify roles
    let chorSeatIndex = 0;
    let policeSeatIndex = 1;
    let informerSeatIndex = 2;
    let protectorSeatIndex = 3;

    room.seats.forEach((seat) => {
      const pState = privateMap.get(seat.uid);
      if (pState) {
        if (pState.role === 'CHOR') chorSeatIndex = seat.seatIndex;
        if (pState.role === 'POLICE') policeSeatIndex = seat.seatIndex;
        if (pState.role === 'INFORMER') informerSeatIndex = seat.seatIndex;
        if (pState.role === 'PROTECTOR') protectorSeatIndex = seat.seatIndex;
      }
    });

    // 3. Find highest voted player(s)
    let maxVotes = -1;
    let mostAccusedSeats: number[] = [];

    Object.entries(voteSummary).forEach(([seatIdxStr, count]) => {
      const seatIdx = Number(seatIdxStr);
      if (count > maxVotes) {
        maxVotes = count;
        mostAccusedSeats = [seatIdx];
      } else if (count === maxVotes && maxVotes > 0) {
        mostAccusedSeats.push(seatIdx);
      }
    });

    let eliminatedSeatIndex = mostAccusedSeats[0];
    let tieResolvedBy: 'POLICE_DECISION' | 'CASE_DETERMINISTIC_RULE' | undefined;

    if (mostAccusedSeats.length > 1) {
      // Tie breaker
      if (room.tieBreaker?.policeDecisionSeatIndex !== undefined && mostAccusedSeats.includes(room.tieBreaker.policeDecisionSeatIndex)) {
        eliminatedSeatIndex = room.tieBreaker.policeDecisionSeatIndex;
        tieResolvedBy = 'POLICE_DECISION';
      } else {
        // Deterministic case fallback rule: pick first tied seat
        eliminatedSeatIndex = mostAccusedSeats[0];
        tieResolvedBy = 'CASE_DETERMINISTIC_RULE';
      }
    }

    const chorEliminated = eliminatedSeatIndex === chorSeatIndex;
    const isTargetProtected = room.seats[eliminatedSeatIndex]?.isProtected && !chorEliminated;

    const winningTeam: 'POLICE_SIDE' | 'CHOR_SIDE' = chorEliminated ? 'POLICE_SIDE' : 'CHOR_SIDE';

    // 4. Calculate points for each player
    const allRoles: GameResult['allRoles'] = [];

    room.seats.forEach((seat) => {
      const pState = privateMap.get(seat.uid);
      if (!pState) return;

      let points = 20; // participation baseline

      // Correct vote for Chor
      if (seat.suspectVotedFor === chorSeatIndex) {
        points += 100;
      }

      if (pState.role === 'CHOR') {
        if (winningTeam === 'CHOR_SIDE') {
          points += 150; // Chor escaped
        }
        if (eliminatedSeatIndex !== chorSeatIndex && maxVotes > 0) {
          points += 50; // successfully led suspicion to innocent
        }
      } else {
        // Police team bonuses
        if (winningTeam === 'POLICE_SIDE') {
          points += 75;
        }

        // Informer bonus
        if (pState.role === 'INFORMER' && winningTeam === 'POLICE_SIDE') {
          const informerVotes = voteSummary[informerSeatIndex] || 0;
          if (informerVotes < maxVotes) {
            points += 40;
          }
        }

        // Protector bonus
        if (pState.role === 'PROTECTOR' && isTargetProtected) {
          points += 40;
        }
      }

      seat.scoreEarned = points;

      allRoles.push({
        seatIndex: seat.seatIndex,
        alias: seat.alias,
        role: pState.role,
        isBot: seat.isBot,
        votesReceived: voteSummary[seat.seatIndex] || 0,
        points,
        isProtected: seat.isProtected
      });
    });

    const result: GameResult = {
      winningTeam,
      chorSeatIndex,
      chorAlias: room.seats[chorSeatIndex]?.alias || 'Chor',
      policeSeatIndex,
      informerSeatIndex,
      protectorSeatIndex,
      allRoles,
      voteSummary,
      correctReasoning: activeCase.correctReasoning,
      tieResolvedBy
    };

    room.result = result;
    room.status = 'FINISHED';
  }

  /**
   * Resets room for Rematch with new role assignments and new case.
   */
  public rematch(roomId: string): Room | null {
    const room = this.activeRooms.get(roomId);
    if (!room) return null;

    // Reset seats
    room.seats.forEach((seat) => {
      seat.isProtected = false;
      seat.suspectVotedFor = null;
      seat.scoreEarned = 0;
      seat.specialActionUsed = false;
    });

    return this.startMatch(roomId, true).room || null;
  }
}

export const gameEngine = GameEngine.getInstance();
