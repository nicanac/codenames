import { ActiveRoomSummary, GameTheme } from './types';

const PLAYER_ID_KEY = 'codenames_player_id';
const PLAYER_NAME_KEY = 'codenames_player_name';
const ACTIVE_ROOMS_KEY = 'codenames_active_rooms';

const RANDOM_SPY_NAMES = [
  'Agent Phénix', 'Agent Faucon', 'Agent Cobra', 'Agent Ombre', 'Agent Silence',
  'Agent Vipère', 'Agent Spectre', 'Agent Cyclone', 'Agent Renard', 'Agent Alpha'
];

const RANDOM_HP_NAMES = [
  'Harry', 'Hermione', 'Ron', 'Neville', 'Luna',
  'Ginny', 'Draco', 'Cédric', 'Tonks', 'Sirius'
];

const DEFAULT_FEATURED_ROOMS: ActiveRoomSummary[] = [
  {
    roomId: 'HOGWARTS',
    theme: 'harrypotter',
    language: 'fr',
    playerCount: 4,
    redCount: 2,
    blueCount: 2,
    status: 'lobby',
    lastActive: Date.now(),
    seed: 'GRYFFINDOR-7',
  },
  {
    roomId: 'POUDLARD-EXPRESS',
    theme: 'harrypotter',
    language: 'fr',
    playerCount: 3,
    redCount: 2,
    blueCount: 1,
    status: 'playing',
    lastActive: Date.now() - 1000 * 60 * 2,
    seed: 'PLATFORM-934',
  },
  {
    roomId: 'SECRET-AGENCY',
    theme: 'classic',
    language: 'fr',
    playerCount: 2,
    redCount: 1,
    blueCount: 1,
    status: 'lobby',
    lastActive: Date.now() - 1000 * 60 * 5,
    seed: 'CIPHER-101',
  },
  {
    roomId: 'DIAGON-ALLEY',
    theme: 'harrypotter',
    language: 'en',
    playerCount: 5,
    redCount: 3,
    blueCount: 2,
    status: 'playing',
    lastActive: Date.now() - 1000 * 60 * 1,
    seed: 'OLLIVANDER-3',
  },
  {
    roomId: 'OMEGA-STRIKE',
    theme: 'classic',
    language: 'en',
    playerCount: 4,
    redCount: 2,
    blueCount: 2,
    status: 'lobby',
    lastActive: Date.now() - 1000 * 60 * 3,
    seed: 'SHADOW-404',
  },
];

export function getStoredActiveRooms(): ActiveRoomSummary[] {
  if (typeof window === 'undefined') return DEFAULT_FEATURED_ROOMS;
  try {
    const raw = localStorage.getItem(ACTIVE_ROOMS_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVE_ROOMS_KEY, JSON.stringify(DEFAULT_FEATURED_ROOMS));
      return DEFAULT_FEATURED_ROOMS;
    }
    const parsed: ActiveRoomSummary[] = JSON.parse(raw);
    return parsed;
  } catch {
    return DEFAULT_FEATURED_ROOMS;
  }
}

export function registerActiveRoom(room: ActiveRoomSummary): ActiveRoomSummary[] {
  if (typeof window === 'undefined') return DEFAULT_FEATURED_ROOMS;
  try {
    const current = getStoredActiveRooms();
    const filtered = current.filter((r) => r.roomId !== room.roomId);
    const updated = [room, ...filtered].slice(0, 20);
    localStorage.setItem(ACTIVE_ROOMS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_FEATURED_ROOMS;
  }
}

export function getLocalPlayerId(): string {
  if (typeof window === 'undefined') return 'server-id';
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getLocalNickname(theme: GameTheme = 'harrypotter'): string {
  if (typeof window === 'undefined') return 'Joueur';
  let name = localStorage.getItem(PLAYER_NAME_KEY);
  if (!name) {
    const list = theme === 'harrypotter' ? RANDOM_HP_NAMES : RANDOM_SPY_NAMES;
    name = list[Math.floor(Math.random() * list.length)];
    localStorage.setItem(PLAYER_NAME_KEY, name);
  }
  return name;
}

export function setLocalNickname(name: string) {
  if (typeof window === 'undefined') return;
  const clean = name.trim();
  if (clean) {
    localStorage.setItem(PLAYER_NAME_KEY, clean);
  }
}

export function generateRandomName(theme: GameTheme = 'harrypotter'): string {
  const list = theme === 'harrypotter' ? RANDOM_HP_NAMES : RANDOM_SPY_NAMES;
  return list[Math.floor(Math.random() * list.length)];
}

export interface RoomSyncMessage {
  type: string;
  payload: unknown;
  senderId?: string;
  timestamp?: number;
}

// In-browser BroadcastChannel for instant multi-tab sync
export class RoomSyncChannel {
  private channel: BroadcastChannel | null = null;
  private roomId: string;
  private onMessageCallback: ((data: RoomSyncMessage) => void) | null = null;

  constructor(roomId: string) {
    this.roomId = roomId;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(`codenames_room_${roomId}`);
      this.channel.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data as RoomSyncMessage);
        }
      };
    }
  }

  public onMessage(callback: (data: RoomSyncMessage) => void) {
    this.onMessageCallback = callback;
  }

  public broadcast(type: string, payload: unknown) {
    if (this.channel) {
      this.channel.postMessage({ type, payload, senderId: getLocalPlayerId(), timestamp: Date.now() });
    }
  }

  public close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
