import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react';
import type { GameState, GameAction } from './types';
import { gameReducer, initialState } from './gameReducer';

const STORAGE_KEY = 'dnd-battle-tracker';

function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    // Restore undoStack as empty (not persisted to save space)
    return { ...parsed, undoStack: [] };
  } catch {
    return null;
  }
}

function saveState(state: GameState): void {
  try {
    // Don't persist undoStack to save space
    const toSave = { ...state, undoStack: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // localStorage full or unavailable
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, () => {
    return loadState() || initialState;
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
