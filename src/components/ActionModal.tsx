import { useState } from 'react';
import type { Character, Effect } from '../types';
import { useGame } from '../GameContext';
import NumberAdjuster from './NumberAdjuster';

interface ActionModalProps {
  character: Character;
  onClose: () => void;
}

type Tab = 'hp' | 'mp' | 'effect';

export default function ActionModal({ character, onClose }: ActionModalProps) {
  const { dispatch } = useGame();
  const [tab, setTab] = useState<Tab>('hp');
  const [hpAmount, setHpAmount] = useState(0);
  const [mpAmount, setMpAmount] = useState(0);
  const [effectTarget, setEffectTarget] = useState<Effect['target']>('hp');
  const [effectValue, setEffectValue] = useState(0);
  const [effectDuration, setEffectDuration] = useState(3);

  const c = character;

  const previewHp = Math.max(0, Math.min(c.maxHp, c.currentHp + hpAmount));
  const previewMp = Math.max(0, Math.min(c.maxMp, c.currentMp + mpAmount));

  const applyHp = () => {
    if (hpAmount === 0) return;
    dispatch({ type: 'MODIFY_HP', characterId: c.id, amount: hpAmount });
    onClose();
  };

  const applyMp = () => {
    if (mpAmount === 0) return;
    dispatch({ type: 'MODIFY_MP', characterId: c.id, amount: mpAmount });
    onClose();
  };

  const applyEffect = () => {
    if (effectValue === 0 || effectDuration <= 0) return;
    dispatch({
      type: 'ADD_EFFECT',
      characterId: c.id,
      effect: { target: effectTarget, value: effectValue, remainingTurns: effectDuration },
    });
    onClose();
  };

  const removeEffect = (effectId: string) => {
    dispatch({ type: 'REMOVE_EFFECT', characterId: c.id, effectId });
  };

  const tabStyle = (t: Tab) =>
    `flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
      tab === t ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 pb-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{c.name}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 text-2xl px-1">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setTab('hp')} className={tabStyle('hp')}>
            ❤️ HP
          </button>
          <button type="button" onClick={() => setTab('mp')} className={tabStyle('mp')}>
            🔵 MP
          </button>
          <button type="button" onClick={() => setTab('effect')} className={tabStyle('effect')}>
            ✨ Effect
          </button>
        </div>

        {/* HP Tab */}
        {tab === 'hp' && (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500">
              Current: <span className="font-bold text-hp">{c.currentHp}</span> / {c.maxHp}
              {hpAmount !== 0 && (
                <span className="ml-2">→ <span className="font-bold text-hp">{previewHp}</span></span>
              )}
            </div>
            <div className="flex justify-center">
              <NumberAdjuster value={hpAmount} onChange={setHpAmount} min={-c.currentHp} max={c.maxHp - c.currentHp} />
            </div>
            <button
              type="button"
              onClick={applyHp}
              disabled={hpAmount === 0}
              className="w-full py-2.5 rounded-lg bg-hp text-white font-semibold disabled:opacity-40 active:opacity-80"
            >
              Apply {hpAmount >= 0 ? '+' : ''}{hpAmount} HP
            </button>
          </div>
        )}

        {/* MP Tab */}
        {tab === 'mp' && (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500">
              Current: <span className="font-bold text-mp">{c.currentMp}</span> / {c.maxMp}
              {mpAmount !== 0 && (
                <span className="ml-2">→ <span className="font-bold text-mp">{previewMp}</span></span>
              )}
            </div>
            <div className="flex justify-center">
              <NumberAdjuster value={mpAmount} onChange={setMpAmount} min={-c.currentMp} max={c.maxMp - c.currentMp} />
            </div>
            <button
              type="button"
              onClick={applyMp}
              disabled={mpAmount === 0}
              className="w-full py-2.5 rounded-lg bg-mp text-white font-semibold disabled:opacity-40 active:opacity-80"
            >
              Apply {mpAmount >= 0 ? '+' : ''}{mpAmount} MP
            </button>
          </div>
        )}

        {/* Effect Tab */}
        {tab === 'effect' && (
          <div className="space-y-4">
            {/* Target selector */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Target</div>
              <div className="grid grid-cols-4 gap-1">
                {(['hp', 'mp', 'armor', 'speed'] as const).map(t => {
                  const emoji = { hp: '❤️', mp: '🔵', armor: '🛡️', speed: '🏃' }[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEffectTarget(t)}
                      className={`py-2 rounded-lg text-sm font-medium ${
                        effectTarget === t ? 'bg-blue-500 text-white' : 'bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Value */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">
                {effectTarget === 'hp' || effectTarget === 'mp' ? 'Per-turn change' : 'Stat modifier'}
              </div>
              <div className="flex justify-center">
                <NumberAdjuster value={effectValue} onChange={setEffectValue} min={-99} max={99} />
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-1">Duration (turns)</div>
              <div className="flex justify-center">
                <NumberAdjuster value={effectDuration} onChange={setEffectDuration} min={1} max={99} />
              </div>
            </div>

            <button
              type="button"
              onClick={applyEffect}
              disabled={effectValue === 0 || effectDuration <= 0}
              className="w-full py-2.5 rounded-lg bg-purple-500 text-white font-semibold disabled:opacity-40 active:opacity-80"
            >
              Add Effect
            </button>
          </div>
        )}

        {/* Active effects list */}
        {c.effects.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500 mb-2">Active Effects</div>
            <div className="space-y-1">
              {c.effects.map(e => {
                const emoji = { hp: '❤️', mp: '🔵', armor: '🛡️', speed: '🏃' }[e.target];
                const sign = e.value >= 0 ? '+' : '';
                return (
                  <div key={e.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-2 py-1.5">
                    <span>
                      {emoji} {sign}{e.value} — {e.remainingTurns} turns left
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEffect(e.id)}
                      className="text-red-400 text-xs px-1 active:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
