import type { GameState, GameAction, Character, Action } from './types';

let nextId = 1;
function genId(): string {
  return String(nextId++);
}

export const initialState: GameState = {
  phase: 'setup',
  characters: [],
  currentRound: 1,
  roundHistory: [],
  currentRoundActions: [],
  undoStack: [],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function snapshotForUndo(state: GameState): GameState {
  // Strip undoStack from snapshot to avoid deep nesting
  return { ...state, undoStack: [] };
}

function getEffectiveArmor(char: Character): number {
  return char.baseArmor + char.effects
    .filter(e => e.target === 'armor')
    .reduce((sum, e) => sum + e.value, 0);
}

function getEffectiveSpeed(char: Character): number {
  return char.baseSpeed + char.effects
    .filter(e => e.target === 'speed')
    .reduce((sum, e) => sum + e.value, 0);
}

export { getEffectiveArmor, getEffectiveSpeed };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state;

    case 'ADD_CHARACTER': {
      const newChar: Character = {
        ...action.character,
        id: genId(),
        currentHp: action.character.maxHp,
        currentMp: action.character.maxMp,
        isDowned: false,
        effects: [],
      };
      return {
        ...state,
        characters: [...state.characters, newChar],
      };
    }

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(c => c.id !== action.characterId),
      };

    case 'START_BATTLE':
      return {
        ...state,
        phase: 'battle',
        currentRound: 1,
        roundHistory: [],
        currentRoundActions: [],
        undoStack: [],
      };

    case 'MODIFY_HP': {
      const snapshot = snapshotForUndo(state);
      const characters = state.characters.map(c => {
        if (c.id !== action.characterId) return c;
        const newHp = clamp(c.currentHp + action.amount, 0, c.maxHp);
        const isDowned = newHp === 0;
        return { ...c, currentHp: newHp, isDowned };
      });
      const char = state.characters.find(c => c.id === action.characterId)!;
      const newHp = clamp(char.currentHp + action.amount, 0, char.maxHp);
      const sign = action.amount >= 0 ? '+' : '';
      const actionLog: Action = {
        characterId: action.characterId,
        characterName: char.name,
        description: `${sign}${action.amount} HP (${char.currentHp} → ${newHp})`,
      };
      return {
        ...state,
        characters,
        currentRoundActions: [...state.currentRoundActions, actionLog],
        undoStack: [...state.undoStack.slice(-49), snapshot],
      };
    }

    case 'MODIFY_MP': {
      const snapshot = snapshotForUndo(state);
      const characters = state.characters.map(c => {
        if (c.id !== action.characterId) return c;
        const newMp = clamp(c.currentMp + action.amount, 0, c.maxMp);
        return { ...c, currentMp: newMp };
      });
      const char = state.characters.find(c => c.id === action.characterId)!;
      const newMp = clamp(char.currentMp + action.amount, 0, char.maxMp);
      const sign = action.amount >= 0 ? '+' : '';
      const actionLog: Action = {
        characterId: action.characterId,
        characterName: char.name,
        description: `${sign}${action.amount} MP (${char.currentMp} → ${newMp})`,
      };
      return {
        ...state,
        characters,
        currentRoundActions: [...state.currentRoundActions, actionLog],
        undoStack: [...state.undoStack.slice(-49), snapshot],
      };
    }

    case 'ADD_EFFECT': {
      const snapshot = snapshotForUndo(state);
      const effectId = genId();
      const characters = state.characters.map(c => {
        if (c.id !== action.characterId) return c;
        return {
          ...c,
          effects: [...c.effects, { ...action.effect, id: effectId }],
        };
      });
      const char = state.characters.find(c => c.id === action.characterId)!;
      const targetEmoji = { hp: '❤️', mp: '🔵', armor: '🛡️', speed: '🏃' }[action.effect.target];
      const sign = action.effect.value >= 0 ? '+' : '';
      const actionLog: Action = {
        characterId: action.characterId,
        characterName: char.name,
        description: `Effect: ${targetEmoji}${sign}${action.effect.value} for ${action.effect.remainingTurns} turns`,
      };
      return {
        ...state,
        characters,
        currentRoundActions: [...state.currentRoundActions, actionLog],
        undoStack: [...state.undoStack.slice(-49), snapshot],
      };
    }

    case 'REMOVE_EFFECT': {
      const snapshot = snapshotForUndo(state);
      const characters = state.characters.map(c => {
        if (c.id !== action.characterId) return c;
        return {
          ...c,
          effects: c.effects.filter(e => e.id !== action.effectId),
        };
      });
      return {
        ...state,
        characters,
        undoStack: [...state.undoStack.slice(-49), snapshot],
      };
    }

    case 'END_TURN': {
      const snapshot = snapshotForUndo(state);
      const endTurnActions: Action[] = [];

      const characters = state.characters.map(c => {
        let newHp = c.currentHp;
        let newMp = c.currentMp;

        // Apply HP/MP tick effects
        for (const effect of c.effects) {
          if (effect.target === 'hp') {
            const oldHp = newHp;
            newHp = clamp(newHp + effect.value, 0, c.maxHp);
            if (oldHp !== newHp) {
              const sign = effect.value >= 0 ? '+' : '';
              endTurnActions.push({
                characterId: c.id,
                characterName: c.name,
                description: `${sign}${effect.value} HP tick (${oldHp} → ${newHp})`,
              });
            }
          } else if (effect.target === 'mp') {
            const oldMp = newMp;
            newMp = clamp(newMp + effect.value, 0, c.maxMp);
            if (oldMp !== newMp) {
              const sign = effect.value >= 0 ? '+' : '';
              endTurnActions.push({
                characterId: c.id,
                characterName: c.name,
                description: `${sign}${effect.value} MP tick (${oldMp} → ${newMp})`,
              });
            }
          }
        }

        // Decrement durations, remove expired
        const updatedEffects = c.effects
          .map(e => ({ ...e, remainingTurns: e.remainingTurns - 1 }))
          .filter(e => {
            if (e.remainingTurns <= 0) {
              const targetEmoji = { hp: '❤️', mp: '🔵', armor: '🛡️', speed: '🏃' }[e.target];
              const sign = e.value >= 0 ? '+' : '';
              endTurnActions.push({
                characterId: c.id,
                characterName: c.name,
                description: `${targetEmoji}${sign}${e.value} expired`,
              });
              return false;
            }
            return true;
          });

        const isDowned = newHp === 0;

        return {
          ...c,
          currentHp: newHp,
          currentMp: newMp,
          isDowned,
          effects: updatedEffects,
        };
      });

      const allActions = [...state.currentRoundActions, ...endTurnActions];
      const roundEntry = {
        round: state.currentRound,
        actions: allActions,
      };

      return {
        ...state,
        characters,
        currentRound: state.currentRound + 1,
        roundHistory: [...state.roundHistory, roundEntry],
        currentRoundActions: [],
        undoStack: [...state.undoStack.slice(-49), snapshot],
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        ...previous,
        undoStack: state.undoStack.slice(0, -1),
      };
    }

    case 'RESTART': {
      const characters = state.characters.map(c => ({
        ...c,
        currentHp: c.maxHp,
        currentMp: c.maxMp,
        isDowned: false,
        effects: [],
      }));
      return {
        ...state,
        characters,
        currentRound: 1,
        roundHistory: [],
        currentRoundActions: [],
        undoStack: [],
      };
    }

    default:
      return state;
  }
}
