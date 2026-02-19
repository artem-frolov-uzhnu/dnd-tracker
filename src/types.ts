export interface Effect {
  id: string;
  target: 'hp' | 'mp' | 'armor' | 'speed';
  value: number;
  remainingTurns: number;
}

export interface Character {
  id: string;
  name: string;
  type: 'hero' | 'enemy';
  maxHp: number;
  currentHp: number;
  maxMp: number;
  currentMp: number;
  baseArmor: number;
  baseSpeed: number;
  isDowned: boolean;
  effects: Effect[];
}

export interface Action {
  characterId: string;
  characterName: string;
  description: string;
}

export interface RoundHistory {
  round: number;
  actions: Action[];
}

export interface GameState {
  phase: 'setup' | 'battle';
  characters: Character[];
  currentRound: number;
  roundHistory: RoundHistory[];
  currentRoundActions: Action[];
  undoStack: GameState[];
}

export type GameAction =
  | { type: 'ADD_CHARACTER'; character: Omit<Character, 'id' | 'isDowned' | 'effects' | 'currentHp' | 'currentMp'> }
  | { type: 'REMOVE_CHARACTER'; characterId: string }
  | { type: 'START_BATTLE' }
  | { type: 'MODIFY_HP'; characterId: string; amount: number }
  | { type: 'MODIFY_MP'; characterId: string; amount: number }
  | { type: 'ADD_EFFECT'; characterId: string; effect: Omit<Effect, 'id'> }
  | { type: 'REMOVE_EFFECT'; characterId: string; effectId: string }
  | { type: 'END_TURN' }
  | { type: 'UNDO' }
  | { type: 'RESTART' }
  | { type: 'LOAD_STATE'; state: GameState };
