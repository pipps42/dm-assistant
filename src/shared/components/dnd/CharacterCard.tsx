import React from "react";
import { PlayerCharacter } from "../../../core/entities/Character";
import { CharacterService } from "../../../core/services/CharacterService";
import BaseCard from "../ui/BaseCard";
import StatusBadge, { LevelBadge, ActiveStatusBadge } from "./StatusBadge";
import ActionButton, {
  EditButton,
  DeleteButton,
  LevelUpButton,
  AchievementButton,
  RelationshipButton,
} from "./ActionButton";
import { CharacterHealthDisplay } from "./HealthTracker";

export interface CharacterCardProps {
  character: PlayerCharacter;
  onEdit?: (character: PlayerCharacter) => void;
  onDelete?: (characterId: string) => void;
  onLevelUp?: (characterId: string) => void;
  onToggleActive?: (characterId: string) => void;
  onAddAchievement?: (character: PlayerCharacter) => void;
  onAddRelationship?: (character: PlayerCharacter) => void;
  onView?: (character: PlayerCharacter) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onEdit,
  onDelete,
  onLevelUp,
  onToggleActive,
  onAddAchievement,
  onAddRelationship,
  onView,
  showActions = true,
  compact = false,
  className = "",
}) => {
  const stats = CharacterService.formatStats(character);
  const relationshipSummary =
    CharacterService.getRelationshipSummary(character);
  const recentAchievements = CharacterService.getRecentAchievements(
    character,
    3
  );
  const canLevelUp = CharacterService.canLevelUp(character);

  const handleCardClick = () => {
    if (onView) {
      onView(character);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      onDelete &&
      window.confirm(`Sei sicuro di voler eliminare ${character.name}?`)
    ) {
      onDelete(character.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <BaseCard
      clickable={!!onView}
      onClick={handleCardClick}
      size={compact ? "sm" : "md"}
      className={`
        ${!character.isActive ? "opacity-75" : ""}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-bold text-gray-900 dark:text-white truncate ${
                compact ? "text-base" : "text-lg"
              }`}
            >
              {character.name}
            </h3>
            <LevelBadge level={character.level} />
            <ActiveStatusBadge isActive={character.isActive} />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {stats.basic}
          </p>

          {!compact && character.background && (
            <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2">
              {character.background}
            </p>
          )}
        </div>

        {showActions && onDelete && (
          <DeleteButton
            size="xs"
            onClick={handleDeleteClick}
            title="Elimina personaggio"
          >
            ✕
          </DeleteButton>
        )}
      </div>

      {/* Health Display */}
      <div className="mb-3">
        <CharacterHealthDisplay maxHp={character.maxHp} />
      </div>

      {/* Stats Summary */}
      {!compact && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="font-medium text-gray-900 dark:text-white">
              {character.achievements.length}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Achievements</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="font-medium text-gray-900 dark:text-white">
              {relationshipSummary.total}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Relazioni</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="font-medium text-gray-900 dark:text-white">
              <span className="text-green-600 dark:text-green-400">
                {relationshipSummary.positive}
              </span>
              /
              <span className="text-red-600 dark:text-red-400">
                {relationshipSummary.negative}
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">Pos/Neg</div>
          </div>
        </div>
      )}

      {/* Recent Achievements Preview */}
      {!compact && recentAchievements.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Achievement Recenti:
          </h4>
          <div className="space-y-1">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="text-xs bg-blue-50 dark:bg-blue-900/30 rounded p-1"
              >
                <div className="font-medium text-blue-900 dark:text-blue-300">
                  {achievement.title}
                </div>
                {achievement.description && (
                  <div className="text-blue-700 dark:text-blue-400 truncate">
                    {achievement.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-1.5">
          {onEdit && (
            <EditButton
              size="xs"
              onClick={(e) => handleActionClick(e, () => onEdit(character))}
            >
              Modifica
            </EditButton>
          )}

          {onLevelUp && canLevelUp && (
            <LevelUpButton
              size="xs"
              onClick={(e) =>
                handleActionClick(e, () => onLevelUp(character.id))
              }
              disabled={!canLevelUp}
            >
              Level Up
            </LevelUpButton>
          )}

          {onToggleActive && (
            <ActionButton
              variant={character.isActive ? "warning" : "success"}
              size="xs"
              onClick={(e) =>
                handleActionClick(e, () => onToggleActive(character.id))
              }
            >
              {character.isActive ? "Disattiva" : "Attiva"}
            </ActionButton>
          )}

          {onAddAchievement && (
            <AchievementButton
              onClick={(e) =>
                handleActionClick(e, () => onAddAchievement(character))
              }
            >
              Achievement
            </AchievementButton>
          )}

          {onAddRelationship && (
            <RelationshipButton
              onClick={(e) =>
                handleActionClick(e, () => onAddRelationship(character))
              }
            >
              Relazione
            </RelationshipButton>
          )}
        </div>
      )}

      {/* DM Notes Preview */}
      {!compact && character.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Note DM:
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {character.notes}
          </p>
        </div>
      )}
    </BaseCard>
  );
};

export default CharacterCard;

// Compact variant per liste dense
export const CompactCharacterCard: React.FC<CharacterCardProps> = (props) => (
  <CharacterCard {...props} compact={true} />
);

// Card per selezione (es. in combat tracker)
export const SelectableCharacterCard: React.FC<
  CharacterCardProps & {
    selected?: boolean;
    onSelect?: (character: PlayerCharacter) => void;
  }
> = ({ selected, onSelect, character, ...props }) => (
  <CharacterCard
    {...props}
    character={character}
    className={`
      ${props.className || ""}
      ${selected ? "ring-2 ring-blue-500 border-blue-500" : ""}
      ${onSelect ? "cursor-pointer" : ""}
    `}
    onView={onSelect ? () => onSelect(character) : props.onView}
    showActions={false}
  />
);

// Card per overview party
export const PartyMemberCard: React.FC<{
  character: PlayerCharacter;
  showQuickActions?: boolean;
}> = ({ character, showQuickActions = false }) => (
  <CharacterCard
    character={character}
    compact={true}
    showActions={showQuickActions}
    className="border-l-4 border-l-blue-500"
  />
);
