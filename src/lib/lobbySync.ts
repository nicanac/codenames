import { GameTheme } from './types';

const PLAYER_ID_KEY = 'codenames_player_id';
const PLAYER_NAME_KEY = 'codenames_player_name';

const RANDOM_SPY_NAMES = [
  'Agent Phénix', 'Agent Faucon', 'Agent Cobra', 'Agent Ombre', 'Agent Silence',
  'Agent Vipère', 'Agent Spectre', 'Agent Cyclone', 'Agent Renard', 'Agent Alpha'
];

const RANDOM_HP_NAMES = [
  'Harry', 'Hermione', 'Ron', 'Neville', 'Luna',
  'Ginny', 'Draco', 'Cédric', 'Tonks', 'Sirius'
];

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
