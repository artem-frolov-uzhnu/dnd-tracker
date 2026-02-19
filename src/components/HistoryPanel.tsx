import { useState } from 'react';
import { useGame } from '../GameContext';

interface HistoryPanelProps {
  onClose: () => void;
}

export default function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { state } = useGame();
  const [expandedRound, setExpandedRound] = useState<number | null>(
    state.roundHistory.length > 0 ? state.roundHistory[state.roundHistory.length - 1].round : null
  );

  const toggle = (round: number) => {
    setExpandedRound(expandedRound === round ? null : round);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">📜 History</h2>
          <button type="button" onClick={onClose} className="text-gray-400 text-2xl px-1">✕</button>
        </div>

        <div className="p-4 space-y-2">
          {state.roundHistory.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No rounds completed yet.</p>
          )}

          {[...state.roundHistory].reverse().map(rh => (
            <div key={rh.round} className="bg-gray-50 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(rh.round)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <span className="font-semibold text-sm">Round {rh.round}</span>
                <span className="text-xs text-gray-400">
                  {rh.actions.length} action{rh.actions.length !== 1 ? 's' : ''}
                  {' '}{expandedRound === rh.round ? '▲' : '▼'}
                </span>
              </button>

              {expandedRound === rh.round && (
                <div className="px-3 pb-3 space-y-1">
                  {rh.actions.length === 0 && (
                    <p className="text-xs text-gray-400">No actions this round.</p>
                  )}
                  {rh.actions.map((a, i) => (
                    <div key={i} className="text-xs bg-white rounded-lg px-2 py-1.5">
                      <span className="font-semibold">{a.characterName}</span>: {a.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
