import { CardType, Clue, GameCard, GameState, HistoryItem, Language, Team } from './types';
import { ENGLISH_WORDS } from './words/en';
import { FRENCH_WORDS } from './words/fr';

// Mulberry32 32-bit PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert string seed to integer
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

// Fisher-Yates shuffle with PRNG
function shuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateSeed(): string {
  const adjectives = ['SECRET', 'AGENT', 'COVERT', 'SHADOW', 'SILENT', 'CIPHER', 'DELTA', 'OMEGA', 'ALPHA', 'BRAVO'];
  const numbers = Math.floor(100 + Math.random() * 900);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  return `${adj}-${numbers}`;
}

export function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getWordList(language: Language): string[] {
  return language === 'fr' ? FRENCH_WORDS : ENGLISH_WORDS;
}

export function createGame(options?: {
  seed?: string;
  roomId?: string;
  language?: Language;
  startingTeam?: Team;
  timerDuration?: number;
}): GameState {
  const language = options?.language || 'fr';
  const seed = options?.seed || generateSeed();
  const roomId = options?.roomId || generateRoomId();
  const timerDuration = options?.timerDuration !== undefined ? options?.timerDuration : 90;

  const rng = mulberry32(hashString(seed));

  // Determine starting team (random if not specified)
  const firstTeam: Team = options?.startingTeam || (rng() < 0.5 ? 'red' : 'blue');
  const secondTeam: Team = firstTeam === 'red' ? 'blue' : 'red';

  // Pick 25 unique words
  const fullWordPool = getWordList(language);
  const shuffledPool = shuffle(fullWordPool, rng);
  const chosenWords = shuffledPool.slice(0, 25);

  // Generate 25 card types:
  // 9 for starting team, 8 for second team, 1 assassin, 7 neutral
  const cardTypes: CardType[] = [
    ...Array(9).fill(firstTeam),
    ...Array(8).fill(secondTeam),
    'assassin',
    ...Array(7).fill('neutral'),
  ];

  const shuffledTypes = shuffle(cardTypes, rng);

  const cards: GameCard[] = chosenWords.map((word, index) => ({
    id: index,
    word,
    type: shuffledTypes[index],
    revealed: false,
  }));

  const initialHistory: HistoryItem = {
    id: 'start-0',
    type: 'start',
    team: firstTeam,
    text: `Game initialized. ${firstTeam === 'red' ? 'Red Team' : 'Blue Team'} goes first with 9 agents.`,
    timestamp: Date.now(),
  };

  return {
    roomId,
    seed,
    language,
    cards,
    firstTeam,
    currentTeam: firstTeam,
    currentClue: null,
    redRemaining: firstTeam === 'red' ? 9 : 8,
    blueRemaining: firstTeam === 'blue' ? 9 : 8,
    winner: null,
    winReason: null,
    history: [initialHistory],
    timerDuration,
    timerSecondsLeft: timerDuration,
    isTimerRunning: timerDuration > 0,
  };
}

export function giveClue(state: GameState, word: string, number: number): { state: GameState; error?: string } {
  if (state.winner) {
    return { state, error: 'The game has ended.' };
  }

  if (state.currentClue) {
    return { state, error: 'A clue has already been given for this turn.' };
  }

  const cleanWord = word.trim().toUpperCase();
  if (!cleanWord) {
    return { state, error: 'Clue word cannot be empty.' };
  }

  // Check if clue matches an unrevealed word on the board
  const matchingCard = state.cards.find(
    (c) => !c.revealed && (c.word.toUpperCase() === cleanWord || cleanWord.includes(c.word.toUpperCase()))
  );
  if (matchingCard) {
    return { state, error: `Invalid clue: "${matchingCard.word}" is an unrevealed card on the board!` };
  }

  // Codenames rule: Operatives get (number + 1) guesses, or unlimited if 0/-1
  const guessesAllowed = number <= 0 ? 99 : number + 1;

  const newClue: Clue = {
    word: cleanWord,
    number,
    team: state.currentTeam,
    timestamp: Date.now(),
    guessesRemaining: guessesAllowed,
  };

  const clueHistory: HistoryItem = {
    id: `clue-${Date.now()}`,
    type: 'clue',
    team: state.currentTeam,
    text: `Gave clue "${cleanWord}" for ${number <= 0 ? 'any number of cards' : number} cards.`,
    timestamp: Date.now(),
  };

  return {
    state: {
      ...state,
      currentClue: newClue,
      history: [clueHistory, ...state.history],
      timerSecondsLeft: state.timerDuration,
      isTimerRunning: state.timerDuration > 0,
    },
  };
}

export function makeGuess(state: GameState, cardId: number): { state: GameState; card: GameCard } {
  if (state.winner) {
    return { state, card: state.cards[cardId] };
  }

  const targetCard = state.cards[cardId];
  if (!targetCard || targetCard.revealed) {
    return { state, card: targetCard };
  }

  const currentTeam = state.currentTeam;
  const opponentTeam: Team = currentTeam === 'red' ? 'blue' : 'red';

  // Mark card as revealed
  const newCards = state.cards.map((c) => (c.id === cardId ? { ...c, revealed: true } : c));

  let redRemaining = state.redRemaining;
  let blueRemaining = state.blueRemaining;
  if (targetCard.type === 'red') redRemaining = Math.max(0, redRemaining - 1);
  if (targetCard.type === 'blue') blueRemaining = Math.max(0, blueRemaining - 1);

  // Check if Assassin was clicked
  if (targetCard.type === 'assassin') {
    const historyItem: HistoryItem = {
      id: `guess-${Date.now()}`,
      type: 'game_over',
      team: currentTeam,
      text: `${currentTeam === 'red' ? 'Red' : 'Blue'} team uncovered the ASSASSIN! (${targetCard.word})`,
      timestamp: Date.now(),
      cardType: 'assassin',
      correct: false,
    };

    return {
      state: {
        ...state,
        cards: newCards,
        redRemaining,
        blueRemaining,
        winner: opponentTeam,
        winReason: 'assassin_hit',
        currentClue: null,
        isTimerRunning: false,
        history: [historyItem, ...state.history],
      },
      card: { ...targetCard, revealed: true },
    };
  }

  // Check if current team picked their own card
  if (targetCard.type === currentTeam) {
    const isWin = (currentTeam === 'red' ? redRemaining : blueRemaining) === 0;

    const historyItem: HistoryItem = {
      id: `guess-${Date.now()}`,
      type: 'guess',
      team: currentTeam,
      text: `Guessed "${targetCard.word}" — Correct! (${currentTeam.toUpperCase()})`,
      timestamp: Date.now(),
      cardType: targetCard.type,
      correct: true,
    };

    if (isWin) {
      return {
        state: {
          ...state,
          cards: newCards,
          redRemaining,
          blueRemaining,
          winner: currentTeam,
          winReason: 'all_cards_found',
          currentClue: null,
          isTimerRunning: false,
          history: [historyItem, ...state.history],
        },
        card: { ...targetCard, revealed: true },
      };
    }

    // Decrement remaining guesses
    const remainingGuesses = state.currentClue ? state.currentClue.guessesRemaining - 1 : 0;

    if (remainingGuesses <= 0 && state.currentClue && state.currentClue.number > 0) {
      // Out of guesses: switch turn
      const endTurnHistory: HistoryItem = {
        id: `pass-${Date.now()}`,
        type: 'pass',
        team: currentTeam,
        text: `${currentTeam === 'red' ? 'Red' : 'Blue'} team completed their guesses. Turn passed.`,
        timestamp: Date.now(),
      };

      return {
        state: {
          ...state,
          cards: newCards,
          redRemaining,
          blueRemaining,
          currentTeam: opponentTeam,
          currentClue: null,
          timerSecondsLeft: state.timerDuration,
          isTimerRunning: state.timerDuration > 0,
          history: [endTurnHistory, historyItem, ...state.history],
        },
        card: { ...targetCard, revealed: true },
      };
    }

    // Still has guesses left
    return {
      state: {
        ...state,
        cards: newCards,
        redRemaining,
        blueRemaining,
        currentClue: state.currentClue
          ? { ...state.currentClue, guessesRemaining: remainingGuesses }
          : null,
        history: [historyItem, ...state.history],
      },
      card: { ...targetCard, revealed: true },
    };
  }

  // If opponent's card was picked
  if (targetCard.type === opponentTeam) {
    const isOpponentWin = (opponentTeam === 'red' ? redRemaining : blueRemaining) === 0;

    const historyItem: HistoryItem = {
      id: `guess-${Date.now()}`,
      type: 'guess',
      team: currentTeam,
      text: `Guessed "${targetCard.word}" — Oops! That belongs to ${opponentTeam.toUpperCase()}.`,
      timestamp: Date.now(),
      cardType: targetCard.type,
      correct: false,
    };

    if (isOpponentWin) {
      return {
        state: {
          ...state,
          cards: newCards,
          redRemaining,
          blueRemaining,
          winner: opponentTeam,
          winReason: 'all_cards_found',
          currentClue: null,
          isTimerRunning: false,
          history: [historyItem, ...state.history],
        },
        card: { ...targetCard, revealed: true },
      };
    }

    // Wrong team card ends turn immediately
    return {
      state: {
        ...state,
        cards: newCards,
        redRemaining,
        blueRemaining,
        currentTeam: opponentTeam,
        currentClue: null,
        timerSecondsLeft: state.timerDuration,
        isTimerRunning: state.timerDuration > 0,
        history: [historyItem, ...state.history],
      },
      card: { ...targetCard, revealed: true },
    };
  }

  // Neutral bystander picked
  const bystanderHistory: HistoryItem = {
    id: `guess-${Date.now()}`,
    type: 'guess',
    team: currentTeam,
    text: `Guessed "${targetCard.word}" — Innocent bystander. Turn ended.`,
    timestamp: Date.now(),
    cardType: 'neutral',
    correct: false,
  };

  return {
    state: {
      ...state,
      cards: newCards,
      redRemaining,
      blueRemaining,
      currentTeam: opponentTeam,
      currentClue: null,
      timerSecondsLeft: state.timerDuration,
      isTimerRunning: state.timerDuration > 0,
      history: [bystanderHistory, ...state.history],
    },
    card: { ...targetCard, revealed: true },
  };
}

export function endTurn(state: GameState): GameState {
  if (state.winner) return state;

  const currentTeam = state.currentTeam;
  const nextTeam: Team = currentTeam === 'red' ? 'blue' : 'red';

  const passHistory: HistoryItem = {
    id: `pass-${Date.now()}`,
    type: 'pass',
    team: currentTeam,
    text: `${currentTeam === 'red' ? 'Red' : 'Blue'} team decided to end their turn.`,
    timestamp: Date.now(),
  };

  return {
    ...state,
    currentTeam: nextTeam,
    currentClue: null,
    timerSecondsLeft: state.timerDuration,
    isTimerRunning: state.timerDuration > 0,
    history: [passHistory, ...state.history],
  };
}
