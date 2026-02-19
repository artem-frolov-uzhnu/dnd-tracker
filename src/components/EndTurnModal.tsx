import type { Character } from '../types';
import { useGame } from '../GameContext';

interface EndTurnModalProps {
  onClose: () => void;
}

interface TickPreview {
  characterName: string;
  description: string;
}

function computeTickPreviews(characters: Character[]): TickPreview[] {
  const previews: TickPreview[] = [];

  for (const c of characters) {
    for (const e of c.effects) {
      const emoji = { hp: '❤️', mp: '🔵', armor: '🛡️', speed: '🏃' }[e.target];
      const sign = e.value >= 0 ? '+' : '';

      if (e.target === 'hp' || e.target === 'mp') {
        previews.push({
          characterName: c.name,
          description: `${emoji}${sign}${e.value} tick (${e.remainingTurns - 1} turns left)`,
        });
      }

      if (e.remainingTurns <= 1) {
        previews.push({
          characterName: c.name,
          description: `${emoji}${sign}${e.value} expires`,
        });
      }
    }
  }

  return previews;
}

export default function EndTurnModal({ onClose }: EndTurnModalProps) {
  const { state, dispatch } = useGame();
  const previews = computeTickPreviews(state.characters);

  const confirm = () => {
    dispatch({ type: 'END_TURN' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-4 mx-4">
        <h2 className="text-lg font-bold mb-3">End Round {state.currentRound}?</h2>

        {previews.length > 0 ? (
          <div className="space-y-1 mb-4 max-h-60 overflow-y-auto">
            {previews.map((p, i) => (
              <div key={i} className="text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-semibold">{p.characterName}</span>: {p.description}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No effects to apply this turn.</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold active:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white font-semibold active:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
