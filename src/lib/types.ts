export type Team = 'red' | 'blue';

export type UserTeamChoice = 'red' | 'blue' | 'both';

export type CardType = 'red' | 'blue' | 'neutral' | 'assassin';

export type PlayerRole = 'operative' | 'spymaster';

export type Language = 'en' | 'fr';

export type GameTheme = 'classic' | 'harrypotter';

export type LobbyViewMode = 'lobby' | 'game';

export interface LobbyPlayer {
  id: string;
  name: string;
  team: Team | 'spectator';
  role: PlayerRole;
  isReady?: boolean;
}

export interface GameCard {
  id: number;
  word: string;
  type: CardType;
  revealed: boolean;
}

export interface Clue {
  word: string;
  number: number; // -1 for unlimited
  team: Team;
  timestamp: number;
  guessesRemaining: number;
}

export type HistoryItemType = 'clue' | 'guess' | 'pass' | 'game_over' | 'start';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  team: Team;
  text: string;
  timestamp: number;
  cardType?: CardType;
  correct?: boolean;
}

export type WinReason = 'all_cards_found' | 'assassin_hit';

export interface GameState {
  roomId: string;
  seed: string;
  language: Language;
  theme: GameTheme;
  cards: GameCard[];
  firstTeam: Team;
  currentTeam: Team;
  currentClue: Clue | null;
  redRemaining: number;
  blueRemaining: number;
  winner: Team | null;
  winReason: WinReason | null;
  history: HistoryItem[];
  timerDuration: number; // 0 for off, or 60, 90, 120 seconds
  timerSecondsLeft: number;
  isTimerRunning: boolean;
}
