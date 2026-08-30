import { BotPersonality, Case, Role, Seat, ActionLog, StructuredActionType } from '../../types';

export class SeededRandom {
  private seed: number;

  constructor(seed: number = 123456789) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  choice<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Cannot choose from empty array');
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }
}

export interface BotState {
  seatIndex: number;
  role: Role;
  personality: BotPersonality;
  privateClue: string;
  suspicionMap: { [seatIndex: number]: number }; // 0 to 100
  questionsAsked: number;
  statementsMade: number;
}

export const BOT_NAMES = [
  'BOT Cedar',
  'BOT Orion',
  'BOT Willow',
  'BOT Jasper',
  'BOT Raven',
  'BOT Blaze',
  'BOT Phoenix',
  'BOT Sterling',
  'BOT Frost',
  'BOT Amber',
  'BOT Echo',
  'BOT Shadow'
];

export function createBotState(
  seatIndex: number,
  role: Role,
  personality: BotPersonality,
  privateClue: string
): BotState {
  const initialMap: { [seatIndex: number]: number } = {};
  for (let i = 0; i < 6; i++) {
    if (i !== seatIndex) {
      initialMap[i] = 20; // baseline suspicion
    }
  }

  // Adjust baseline based on personality
  if (personality === 'CONFIDENT_ACCUSER') {
    for (let i = 0; i < 6; i++) {
      if (i !== seatIndex) initialMap[i] = 30;
    }
  }

  return {
    seatIndex,
    role,
    personality,
    privateClue,
    suspicionMap: initialMap,
    questionsAsked: 0,
    statementsMade: 0
  };
}

/**
 * Updates bot suspicion based on public action logs and known contradictions.
 * Enforces strict knowledge isolation: only public logs and bot's own clue are used.
 */
export function updateBotSuspicion(
  bot: BotState,
  actionLogs: ActionLog[],
  activeCase: Case
): BotState {
  const updatedMap = { ...bot.suspicionMap };

  // Analyze statements against contradictions
  actionLogs.forEach((log) => {
    if (log.actorSeatIndex === bot.seatIndex) return;

    const target = log.actorSeatIndex;

    // Check if the log matches a statement in contradiction map
    const matchingContradiction = activeCase.contradictionMap.find(
      (c) =>
        activeCase.allowedStatements.find((s) => s.id === c.statementId)?.text === log.content ||
        activeCase.allowedStatements.find((s) => s.id === c.counterStatementId)?.text === log.content
    );

    if (matchingContradiction) {
      // If someone made a contradicted statement
      const isChorContradiction = activeCase.allowedStatements.find(
        (s) => s.id === matchingContradiction.statementId
      )?.text === log.content;

      if (isChorContradiction) {
        // High suspicion bump for making false claim
        const weight = bot.personality === 'EVIDENCE_FOCUSED' ? 45 : 30;
        updatedMap[target] = Math.min(100, (updatedMap[target] || 20) + weight);
      }
    }

    // Reaction to suspicion accusation
    if (log.actionType === 'SUSPICION' && log.targetSeatIndex !== undefined) {
      if (bot.personality === 'EASILY_PERSUADED') {
        updatedMap[log.targetSeatIndex] = Math.min(100, (updatedMap[log.targetSeatIndex] || 20) + 15);
      } else if (bot.personality === 'NERVOUS_DEFENDER' && log.targetSeatIndex === bot.seatIndex) {
        // Accused the bot - bot retaliates with suspicion on accuser
        updatedMap[log.actorSeatIndex] = Math.min(100, (updatedMap[log.actorSeatIndex] || 20) + 20);
      }
    }

    // Reaction to defense
    if (log.actionType === 'DEFENSE') {
      if (bot.personality === 'EVIDENCE_FOCUSED') {
        updatedMap[target] = Math.max(0, (updatedMap[target] || 20) - 5);
      }
    }
  });

  return {
    ...bot,
    suspicionMap: updatedMap
  };
}

/**
 * Generates an appropriate deterministic action for a bot during Phase 4 (Investigation).
 */
export function generateBotInvestigationAction(
  bot: BotState,
  allSeats: Seat[],
  activeCase: Case,
  rng: SeededRandom
): {
  actionType: StructuredActionType;
  content: string;
  targetSeatIndex?: number;
  targetAlias?: string;
  emoji?: string;
} {
  // Find highest suspicion target
  let highestSuspect = -1;
  let highestScore = -1;

  Object.entries(bot.suspicionMap).forEach(([seatIdxStr, score]) => {
    const seatIdx = Number(seatIdxStr);
    if (seatIdx !== bot.seatIndex && score > highestScore) {
      highestScore = score;
      highestSuspect = seatIdx;
    }
  });

  if (highestSuspect === -1) {
    const otherSeats = allSeats.filter((s) => s.seatIndex !== bot.seatIndex);
    highestSuspect = rng.choice(otherSeats).seatIndex;
  }

  const targetSeat = allSeats.find((s) => s.seatIndex === highestSuspect);
  const targetAlias = targetSeat ? targetSeat.alias : `Player ${highestSuspect + 1}`;

  // Chor Bot Strategy: Defend, Plant Doubt, or Make Cover Statement
  if (bot.role === 'CHOR') {
    const chorChoices: Array<() => { actionType: StructuredActionType; content: string; targetSeatIndex?: number; targetAlias?: string; emoji?: string }> = [
      () => ({
        actionType: 'STATEMENT',
        content: bot.privateClue
      }),
      () => {
        const doubt = rng.choice(activeCase.plantDoubtOptions);
        return {
          actionType: 'STATEMENT',
          content: doubt.text
        };
      },
      () => ({
        actionType: 'DEFENSE',
        content: `My presence at ${activeCase.location} was fully documented and corroborated by bystanders during the incident.`
      }),
      () => ({
        actionType: 'DEFENSE',
        content: `I have a verifiable alibi in the registry records. The physical timeline evidence completely exonerates me.`
      }),
      () => {
        const question = rng.choice(activeCase.predefinedQuestions);
        return {
          actionType: 'QUESTION',
          content: question.text,
          targetSeatIndex: highestSuspect,
          targetAlias
        };
      }
    ];

    return rng.choice(chorChoices)();
  }

  // Police Bot Strategy: Inspect timeline & confront suspect
  if (bot.role === 'POLICE') {
    const policeChoices: Array<() => { actionType: StructuredActionType; content: string; targetSeatIndex?: number; targetAlias?: string; emoji?: string }> = [
      () => ({
        actionType: 'STATEMENT',
        content: `Official verified evidence: ${bot.privateClue}`
      }),
      () => {
        const q = activeCase.predefinedQuestions.find((pq) => pq.category === 'timeline') || activeCase.predefinedQuestions[0];
        return {
          actionType: 'QUESTION',
          content: q.text,
          targetSeatIndex: highestSuspect,
          targetAlias
        };
      },
      () => ({
        actionType: 'SUSPICION',
        content: `Based on verified evidence records, ${targetAlias}'s alibi has major contradictions.`,
        targetSeatIndex: highestSuspect,
        targetAlias
      })
    ];

    return rng.choice(policeChoices)();
  }

  // Informer Bot Strategy: Reveal secret clue without naming role
  if (bot.role === 'INFORMER') {
    const informerChoices: Array<() => { actionType: StructuredActionType; content: string; targetSeatIndex?: number; targetAlias?: string; emoji?: string }> = [
      () => ({
        actionType: 'STATEMENT',
        content: `Key eyewitness lead: ${bot.privateClue}`
      }),
      () => {
        const q = activeCase.predefinedQuestions.find((pq) => pq.category === 'evidence') || activeCase.predefinedQuestions[0];
        return {
          actionType: 'QUESTION',
          content: q.text,
          targetSeatIndex: highestSuspect,
          targetAlias
        };
      }
    ];

    return rng.choice(informerChoices)();
  }

  // Citizen & Protector Strategy
  const genericStatements = activeCase.allowedStatements.filter((s) => s.roleTypeHint === 'CITIZEN');
  const statementToMake = genericStatements.length > 0 ? rng.choice(genericStatements).text : bot.privateClue;

  const standardChoices: Array<() => { actionType: StructuredActionType; content: string; targetSeatIndex?: number; targetAlias?: string; emoji?: string }> = [
    () => ({
      actionType: 'STATEMENT',
      content: statementToMake
    }),
    () => {
      const q = rng.choice(activeCase.predefinedQuestions);
      return {
        actionType: 'QUESTION',
        content: q.text,
        targetSeatIndex: highestSuspect,
        targetAlias
      };
    },
    () => ({
      actionType: 'SUSPICION',
      content: `I find ${targetAlias}'s statements inconsistent with the physical evidence.`,
      targetSeatIndex: highestSuspect,
      targetAlias
    }),
    () => ({
      actionType: 'EMOJI',
      content: 'Thinking carefully...',
      emoji: '🤔'
    })
  ];

  return rng.choice(standardChoices)();
}

/**
 * Determines a bot's vote in Phase 6 based on suspicion matrix.
 */
export function determineBotVote(bot: BotState, allSeats: Seat[], rng: SeededRandom): number {
  let candidates: { seatIndex: number; score: number }[] = [];

  Object.entries(bot.suspicionMap).forEach(([seatIdxStr, score]) => {
    const seatIdx = Number(seatIdxStr);
    if (seatIdx !== bot.seatIndex) {
      candidates.push({ seatIndex: seatIdx, score });
    }
  });

  if (candidates.length === 0) {
    const otherSeats = allSeats.filter((s) => s.seatIndex !== bot.seatIndex);
    return rng.choice(otherSeats).seatIndex;
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  const highestScore = candidates[0].score;
  const topCandidates = candidates.filter((c) => c.score === highestScore);

  // Pick deterministically using RNG if there's a tie
  return rng.choice(topCandidates).seatIndex;
}

/**
 * Determines Protector bot's target to protect.
 * Protects innocent player with highest suspicion (to shield them from elimination).
 */
export function determineBotProtection(bot: BotState, allSeats: Seat[], rng: SeededRandom): number {
  // Protector wants to protect an innocent player who is being heavily accused
  const otherSeats = allSeats.filter((s) => s.seatIndex !== bot.seatIndex);
  let highestSuspect = otherSeats[0].seatIndex;
  let maxScore = -1;

  otherSeats.forEach((s) => {
    const score = bot.suspicionMap[s.seatIndex] || 0;
    if (score > maxScore) {
      maxScore = score;
      highestSuspect = s.seatIndex;
    }
  });

  return highestSuspect;
}
