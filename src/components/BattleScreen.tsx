import { useState } from 'react';
import type { Character } from '../types';
import { useGame } from '../GameContext';
import CharacterTile from './CharacterTile';
import ActionModal from './ActionModal';
import EndTurnModal from './EndTurnModal';
import HistoryPanel from './HistoryPanel';

export default function BattleScreen() {
  const { state, dispatch } = useGame();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showEndTurn, setShowEndTurn] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const heroes = state.characters.filter(c => c.type === 'hero');
  const enemies = state.characters.filter(c => c.type === 'enemy');

  // Get fresh character data when modal is open
  const freshSelectedCharacter = selectedCharacter
    ? state.characters.find(c => c.id === selectedCharacter.id) || null
    : null;

  return (
    <div className="min-h-full flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <span className="text-sm font-bold">⚔️ Round {state.currentRound}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.undoStack.length === 0}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 disabled:opacity-30 active:bg-gray-200"
            >
              ↩ Undo
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 active:bg-gray-200"
            >
              📜
            </button>
            <button
              type="button"
              onClick={() => setShowRestartConfirm(true)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 active:bg-gray-200"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Character grid */}
      <div className="flex-1 p-3 max-w-lg mx-auto w-full">
        {/* Heroes */}
        {heroes.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-hero uppercase tracking-wide mb-2">🦸 Heroes</div>
            <div className="grid grid-cols-2 gap-2">
              {heroes.map(c => (
                <CharacterTile
                  key={c.id}
                  character={c}
                  onClick={() => setSelectedCharacter(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Enemies */}
        {enemies.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-enemy uppercase tracking-wide mb-2">👹 Enemies</div>
            <div className="grid grid-cols-2 gap-2">
              {enemies.map(c => (
                <CharacterTile
                  key={c.id}
                  character={c}
                  onClick={() => setSelectedCharacter(c)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* End Turn button */}
      <div className="sticky bottom-0 p-3 bg-white/90 backdrop-blur border-t border-gray-200">
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => setShowEndTurn(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold active:opacity-80"
          >
            End Round {state.currentRound} →
          </button>
        </div>
      </div>

      {/* Modals */}
      {freshSelectedCharacter && (
        <ActionModal
          character={freshSelectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}

      {showEndTurn && (
        <EndTurnModal onClose={() => setShowEndTurn(false)} />
      )}

      {showHistory && (
        <HistoryPanel onClose={() => setShowHistory(false)} />
      )}

      {/* Restart confirm */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRestartConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-4 mx-4 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Restart Battle?</h2>
            <p className="text-sm text-gray-500 mb-4">
              All characters will be restored to full HP/MP, effects cleared, and round reset to 1. History will be cleared.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold active:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: 'RESTART' });
                  setShowRestartConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-semibold active:bg-red-600"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
