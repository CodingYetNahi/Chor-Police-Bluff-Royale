export type Role = 'CHOR' | 'POLICE' | 'INFORMER' | 'PROTECTOR' | 'CITIZEN';

export type GamePhase =
  | 'CASE_INTRO'
  | 'SECRET_ROLE'
  | 'EVIDENCE_REVIEW'
  | 'INVESTIGATION'
  | 'SPECIAL_ACTIONS'
  | 'FINAL_VOTING'
  | 'REVEAL'
  | 'REMATCH';

export type RoomPolicy = 'HUMANS_ONLY' | 'FILL_WITH_BOTS' | 'OPEN_REMAINING_SEATS';

export type RoomStatus = 'LOBBY' | 'IN_GAME' | 'FINISHED' | 'EXPIRED';

export type BotPersonality =
  | 'EVIDENCE_FOCUSED'
  | 'CONFIDENT_ACCUSER'
  | 'QUIET_OBSERVER'
  | 'NERVOUS_DEFENDER'
  | 'EASILY_PERSUADED'
  | 'STRATEGIC_BLUFFER';

export interface EvidenceItem {
  id: string;
  name: string;
  description: string;
  tag: string;
  inspectedDetail?: string;
}

export interface Case {
  id: string;
  title: string;
  intro: string;
  summary?: string;
  stakes?: string;
  category?: string;
  location: string;
  timeline?: Array<{ time: string; event: string }>;
  publicEvidence: EvidenceItem[];
  roleClues: {
    chorCoverClue: string;
    policeVerifiedClue: string;
    informerSecretClue: string;
    protectorDefenseClue: string;
    citizenClues: string[];
  };
  predefinedQuestions: Array<{
    id: string;
    text: string;
    category: 'alibi' | 'timeline' | 'evidence' | 'motive';
  }>;
  allowedStatements: Array<{
    id: string;
    text: string;
    roleTypeHint?: string;
    contradictionTargetId?: string;
  }>;
  plantDoubtOptions: Array<{
    id: string;
    text: string;
  }>;
  contradictionMap: Array<{
    statementId: string;
    counterStatementId: string;
    explanation: string;
  }>;
  correctReasoning: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  contentSafetyStatus: 'APPROVED';
  enabled: boolean;
}

export interface Seat {
  seatIndex: number;
  uid: string;
  alias: string;
  isBot: boolean;
  botPersonality?: BotPersonality;
  isReady: boolean;
  isHost: boolean;
  isProtected: boolean;
  suspectVotedFor: number | null; // target seatIndex or -1 for abstain
  scoreEarned: number;
  specialActionUsed: boolean;
  connected: boolean;
}

export type StructuredActionType =
  | 'QUESTION'
  | 'STATEMENT'
  | 'SUSPICION'
  | 'DEFENSE'
  | 'CLUE_REVEAL'
  | 'EMOJI'
  | 'SPECIAL_INSPECT'
  | 'SPECIAL_PROTECT'
  | 'SPECIAL_PLANT_DOUBT';

export interface ActionLog {
  id: string;
  timestamp: number;
  actorSeatIndex: number;
  actorAlias: string;
  targetSeatIndex?: number;
  targetAlias?: string;
  actionType: StructuredActionType;
  content: string;
  emoji?: string;
}

export interface PrivatePlayerState {
  seatIndex: number;
  role: Role;
  objective: string;
  privateClue: string;
  roleTitle: string;
  specialActionName: string;
  specialActionDescription: string;
  specialActionFeedback?: string;
  hasAcknowledgedRole: boolean;
}

export interface GameResult {
  winningTeam: 'POLICE_SIDE' | 'CHOR_SIDE';
  chorSeatIndex: number;
  chorAlias: string;
  policeSeatIndex: number;
  informerSeatIndex: number;
  protectorSeatIndex: number;
  allRoles: Array<{
    seatIndex: number;
    alias: string;
    role: Role;
    isBot: boolean;
    votesReceived: number;
    points: number;
    isProtected: boolean;
  }>;
  voteSummary: { [seatIndex: number]: number };
  correctReasoning: string;
  tieResolvedBy?: 'POLICE_DECISION' | 'CASE_DETERMINISTIC_RULE';
}

export interface Room {
  id: string;
  code: string;
  hostUid: string;
  isPrivate: boolean;
  policy: RoomPolicy;
  status: RoomStatus;
  caseId: string;
  caseData?: Case;
  currentPhase: GamePhase;
  phaseEndsAt: number;
  seats: Seat[];
  actionLogs: ActionLog[];
  specialActionResolutions: {
    policeInspectedEvidenceId?: string;
    policeInspectionResult?: string;
    protectorTargetSeatIndex?: number;
    chorPlantedDoubt?: string;
  };
  tieBreaker: {
    inTie: boolean;
    tiedSeatIndices: number[];
    policeDecisionSeatIndex?: number;
    deadline?: number;
  } | null;
  result: GameResult | null;
  createdAt: number;
  expiresAt: number;
}

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  correctAccusations: number;
  chorEscapes: number;
  bestRole: Role;
  currentScore: number;
  rankTier: string;
  recentMatches: Array<{
    matchId: string;
    caseTitle: string;
    role: Role;
    result: 'WIN' | 'LOSS';
    points: number;
    date: string;
  }>;
}

export interface UserSettings {
  masterSound: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  vibrationEnabled: boolean;
  reducedMotion: boolean;
  alias: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  type: 'FIRST_TRIAL_FREE' | 'TWO_HOUR_HOST_PASS';
  expiresAt: number;
  orderId?: string;
  paymentId?: string;
  amount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'REFUNDED';
}
