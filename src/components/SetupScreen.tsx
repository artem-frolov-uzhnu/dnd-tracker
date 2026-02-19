import { useState } from 'react';
import { useGame } from '../GameContext';
import NumberAdjuster from './NumberAdjuster';

export default function SetupScreen() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState('');
  const [type, setType] = useState<'hero' | 'enemy'>('hero');
  const [maxHp, setMaxHp] = useState(20);
  const [maxMp, setMaxMp] = useState(10);
  const [baseArmor, setBaseArmor] = useState(10);
  const [baseSpeed, setBaseSpeed] = useState(30);

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'ADD_CHARACTER',
      character: { name: name.trim(), type, maxHp, maxMp, baseArmor, baseSpeed },
    });
    setName('');
  };

  const canStart = state.characters.length >= 2;

  return (
    <div className="min-h-full flex flex-col p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">⚔️ Battle Setup</h1>

      {/* Character form */}
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Character name"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />

        {/* Type toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('hero')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              type === 'hero'
                ? 'bg-hero text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            🦸 Hero
          </button>
          <button
            type="button"
            onClick={() => setType('enemy')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              type === 'enemy'
                ? 'bg-enemy text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            👹 Enemy
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-hp">❤️ HP</span>
            <NumberAdjuster value={maxHp} onChange={setMaxHp} min={1} max={999} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-mp">🔵 MP</span>
            <NumberAdjuster value={maxMp} onChange={setMaxMp} min={0} max={999} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-armor">🛡️ Armor</span>
            <NumberAdjuster value={baseArmor} onChange={setBaseArmor} min={0} max={99} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-speed">🏃 Speed</span>
            <NumberAdjuster value={baseSpeed} onChange={setBaseSpeed} min={0} max={99} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full py-2.5 rounded-lg bg-blue-500 text-white font-semibold disabled:opacity-40 active:bg-blue-600"
        >
          Add Character
        </button>
      </div>

      {/* Character list */}
      {state.characters.length > 0 && (
        <div className="mt-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Characters ({state.characters.length})
          </h2>
          {state.characters.map(c => (
            <div
              key={c.id}
              className={`flex items-center justify-between p-3 rounded-lg border-l-4 bg-white shadow-sm ${
                c.type === 'hero' ? 'border-hero' : 'border-enemy'
              }`}
            >
              <div>
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  HP:{c.maxHp} MP:{c.maxMp} 🛡️{c.baseArmor} 🏃{c.baseSpeed}
                </span>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_CHARACTER', characterId: c.id })}
                className="text-red-400 text-xl px-2 active:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Start button */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => dispatch({ type: 'START_BATTLE' })}
          disabled={!canStart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-hero to-blue-500 text-white text-lg font-bold disabled:opacity-40 active:opacity-80"
        >
          ⚔️ Start Battle
        </button>
        {!canStart && (
          <p className="text-center text-sm text-gray-400 mt-1">
            Add at least 2 characters to begin
          </p>
        )}
      </div>
    </div>
  );
}
