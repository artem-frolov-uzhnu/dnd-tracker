import type { Character } from '../types';
import { getEffectiveArmor, getEffectiveSpeed } from '../gameReducer';

interface CharacterTileProps {
  character: Character;
  onClick: () => void;
}

export default function CharacterTile({ character, onClick }: CharacterTileProps) {
  const c = character;
  const effectiveArmor = getEffectiveArmor(c);
  const effectiveSpeed = getEffectiveSpeed(c);
  const hpPct = c.maxHp > 0 ? (c.currentHp / c.maxHp) * 100 : 0;
  const mpPct = c.maxMp > 0 ? (c.currentMp / c.maxMp) * 100 : 0;

  const borderColor = c.type === 'hero' ? 'border-hero' : 'border-enemy';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left p-3 rounded-xl border-2 bg-white shadow-sm active:shadow-md transition-shadow ${borderColor} ${
        c.isDowned ? 'opacity-50' : ''
      }`}
    >
      {/* Downed overlay */}
      {c.isDowned && (
        <div className="absolute inset-0 flex items-center justify-center text-4xl rounded-xl bg-gray-900/10 z-10">
          💀
        </div>
      )}

      {/* Name */}
      <div className="font-bold text-sm truncate mb-2">{c.name}</div>

      {/* Stats 2x2 grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {/* HP */}
        <div>
          <div className="flex justify-between items-center">
            <span>❤️</span>
            <span className="font-semibold tabular-nums">{c.currentHp}/{c.maxHp}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-hp rounded-full transition-all duration-300"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* MP */}
        <div>
          <div className="flex justify-between items-center">
            <span>🔵</span>
            <span className="font-semibold tabular-nums">{c.currentMp}/{c.maxMp}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-mp rounded-full transition-all duration-300"
              style={{ width: `${mpPct}%` }}
            />
          </div>
        </div>

        {/* Armor */}
        <div className="flex justify-between items-center mt-1">
          <span>🛡️</span>
          <span className={`font-semibold tabular-nums ${effectiveArmor !== c.baseArmor ? (effectiveArmor > c.baseArmor ? 'text-green-600' : 'text-red-500') : ''}`}>
            {effectiveArmor}
          </span>
        </div>

        {/* Speed */}
        <div className="flex justify-between items-center mt-1">
          <span>🏃</span>
          <span className={`font-semibold tabular-nums ${effectiveSpeed !== c.baseSpeed ? (effectiveSpeed > c.baseSpeed ? 'text-green-600' : 'text-red-500') : ''}`}>
            {effectiveSpeed}
          </span>
        </div>
      </div>

      {/* Active effects */}
      {c.effects.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {c.effects.map(e => {
            const emoji = { hp: '❤️', mp: '🔵', armor: '🛡️', speed: '🏃' }[e.target];
            const sign = e.value >= 0 ? '+' : '';
            const color = e.value >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
            return (
              <span key={e.id} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${color}`}>
                {emoji}{sign}{e.value}({e.remainingTurns})
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}
