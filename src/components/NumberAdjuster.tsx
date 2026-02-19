interface NumberAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export default function NumberAdjuster({ value, onChange, min, max, label }: NumberAdjusterProps) {
  const decrement = () => {
    const next = value - 1;
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const increment = () => {
    const next = value + 1;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-gray-600 min-w-12">{label}</span>}
      <button
        type="button"
        onClick={decrement}
        className="w-10 h-10 rounded-lg bg-gray-200 text-xl font-bold active:bg-gray-300 flex items-center justify-center"
      >
        −
      </button>
      <span className="w-12 text-center text-lg font-bold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={increment}
        className="w-10 h-10 rounded-lg bg-gray-200 text-xl font-bold active:bg-gray-300 flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
