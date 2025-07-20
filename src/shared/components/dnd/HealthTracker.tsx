import React from "react";

export interface HealthTrackerProps {
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  showNumbers?: boolean;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  onHpChange?: (newHp: number) => void;
  editable?: boolean;
}

const HealthTracker: React.FC<HealthTrackerProps> = ({
  currentHp,
  maxHp,
  tempHp = 0,
  showNumbers = true,
  showPercentage = false,
  size = "md",
  className = "",
  onHpChange,
  editable = false,
}) => {
  // Calculate percentages
  const hpPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const totalHp = currentHp + tempHp;
  const totalPercentage = Math.min(100, (totalHp / maxHp) * 100);

  // Determine health status color
  const getHealthColor = (percentage: number): string => {
    if (percentage > 75) return "bg-green-500";
    if (percentage > 50) return "bg-yellow-500";
    if (percentage > 25) return "bg-orange-500";
    if (percentage > 0) return "bg-red-500";
    return "bg-gray-400";
  };

  // Size classes
  const sizeClasses = {
    sm: "h-2",
    md: "h-4",
    lg: "h-6",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Handle HP adjustment
  const adjustHp = (delta: number) => {
    if (!editable || !onHpChange) return;

    const newHp = Math.max(0, Math.min(maxHp, currentHp + delta));
    onHpChange(newHp);
  };

  return (
    <div className={`health-tracker ${className}`}>
      {/* Header with HP numbers */}
      {showNumbers && (
        <div
          className={`flex justify-between items-center mb-1 ${textSizeClasses[size]}`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">HP</span>

            {editable && onHpChange && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustHp(-1)}
                  className="w-5 h-5 rounded bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold flex items-center justify-center"
                  disabled={currentHp <= 0}
                >
                  -
                </button>
                <button
                  onClick={() => adjustHp(1)}
                  className="w-5 h-5 rounded bg-green-100 hover:bg-green-200 text-green-600 text-xs font-bold flex items-center justify-center"
                  disabled={currentHp >= maxHp}
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono">
              <span
                className={
                  currentHp <= 0 ? "text-red-600 font-bold" : "text-gray-900"
                }
              >
                {currentHp}
              </span>
              {tempHp > 0 && <span className="text-blue-600">+{tempHp}</span>}
              <span className="text-gray-500">/{maxHp}</span>
            </span>

            {showPercentage && (
              <span className="text-gray-500 text-xs">
                ({Math.round(hpPercentage)}%)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Health bar */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden border`}
      >
        {/* Main HP bar */}
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 ${getHealthColor(
            hpPercentage
          )}`}
          style={{ width: `${hpPercentage}%` }}
        />

        {/* Temp HP overlay */}
        {tempHp > 0 && (
          <div
            className="absolute inset-y-0 left-0 bg-blue-400 opacity-60 transition-all duration-300"
            style={{ width: `${totalPercentage}%` }}
          />
        )}

        {/* Gradient overlay for style */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Status indicators */}
      <div className={`flex justify-between mt-1 ${textSizeClasses[size]}`}>
        <div className="flex gap-2">
          {currentHp <= 0 && (
            <span className="text-red-600 font-bold">💀 Unconscious</span>
          )}
          {currentHp > 0 && currentHp <= maxHp * 0.25 && (
            <span className="text-orange-600 font-medium">
              ⚠️ Gravemente ferito
            </span>
          )}
          {tempHp > 0 && (
            <span className="text-blue-600 text-xs">+{tempHp} temp</span>
          )}
        </div>

        {editable && onHpChange && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustHp(-5)}
              className="px-2 py-0.5 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded"
              disabled={currentHp <= 0}
            >
              -5
            </button>
            <button
              onClick={() => adjustHp(5)}
              className="px-2 py-0.5 text-xs bg-green-100 hover:bg-green-200 text-green-600 rounded"
              disabled={currentHp >= maxHp}
            >
              +5
            </button>
            <button
              onClick={() => onHpChange(maxHp)}
              className="px-2 py-0.5 text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
              disabled={currentHp >= maxHp}
            >
              Full
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthTracker;

// Preset components for common usage
export const SimpleHealthBar: React.FC<{
  currentHp: number;
  maxHp: number;
  className?: string;
}> = ({ currentHp, maxHp, className }) => (
  <HealthTracker
    currentHp={currentHp}
    maxHp={maxHp}
    size="sm"
    showNumbers={false}
    className={className}
  />
);

export const CombatHealthTracker: React.FC<{
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  onHpChange: (newHp: number) => void;
  className?: string;
}> = ({ currentHp, maxHp, tempHp, onHpChange, className }) => (
  <HealthTracker
    currentHp={currentHp}
    maxHp={maxHp}
    tempHp={tempHp}
    size="lg"
    showNumbers={true}
    showPercentage={true}
    editable={true}
    onHpChange={onHpChange}
    className={className}
  />
);

export const CharacterHealthDisplay: React.FC<{
  maxHp: number;
  className?: string;
}> = ({ maxHp, className }) => (
  <HealthTracker
    currentHp={maxHp}
    maxHp={maxHp}
    size="sm"
    showNumbers={true}
    showPercentage={false}
    className={className}
  />
);
