import React from "react";
import { Character } from "../types/character";
import {
  Axe,
  BowArrow,
  Cross,
  Heart,
  PawPrint,
  Shield,
  Sparkles,
  Sword,
  WandSparkles,
  User,
  MoreVertical,
} from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onEdit?: (character: Character) => void;
  onDelete?: (id: string) => void;
  onView?: (character: Character) => void;
  onClick?: (character: Character) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onEdit,
  onDelete,
  onView,
  onClick,
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(character);
    } else if (onView) {
      onView(character);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(character);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Sei sicuro di voler eliminare ${character.name}?`)) {
      onDelete?.(character.id);
    }
  };

  const getClassIcon = (characterClass: string) => {
    switch (characterClass.toLowerCase()) {
      case "barbarian":
        return <Axe className="w-4 h-4 text-red-500" />;
      case "bard":
        return <span className="text-blue-400">🎵</span>;
      case "cleric":
        return <Cross className="w-4 h-4 text-yellow-500" />;
      case "druid":
        return <PawPrint className="w-4 h-4" />;
      case "fighter":
        return <Sword className="w-4 h-4" />;
      case "monk":
        return <span className="text-orange-400">👊</span>;
      case "paladin":
        return <Shield className="w-4 h-4" />;
      case "ranger":
        return <BowArrow className="w-4 h-4" />;
      case "rogue":
        return <span className="text-gray-400">🗡️</span>;
      case "sorcerer":
      case "warlock":
        return <Sparkles className="w-4 h-4" />;
      case "wizard":
        return <WandSparkles className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getHealthBarColor = (current: number, max: number): string => {
    const percentage = (current / max) * 100;
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div
      className="character-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {character.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Name and Basic Info */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                {character.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                {getClassIcon(character.class)}
                <span>
                  {character.race} {character.class}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex items-center gap-1">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
              Liv. {character.level}
            </span>

            {(onEdit || onDelete) && (
              <div className="relative group">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Modifica
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                    >
                      Elimina
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        {/* Health Bar */}
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Punti Ferita</span>
              <span>
                {character.hitPoints}/{character.maxHitPoints}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getHealthBarColor(
                  character.hitPoints,
                  character.maxHitPoints
                )}`}
                style={{
                  width: `${
                    (character.hitPoints / character.maxHitPoints) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
