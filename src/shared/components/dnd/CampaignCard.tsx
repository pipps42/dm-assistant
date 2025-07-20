import React from "react";
import { Campaign, CampaignSummary } from "@/core/entities/Campaign";
import { CampaignService } from "@/core/services/CampaignService";
import BaseCard from "../ui/BaseCard";
import StatusBadge from "./StatusBadge";
import ActionButton, {
  EditButton,
  DeleteButton,
  CreateButton,
} from "./ActionButton";

export interface CampaignCardProps {
  campaign: Campaign | CampaignSummary;
  onEdit?: (campaign: Campaign | CampaignSummary) => void;
  onDelete?: (campaignId: string) => void;
  onSelect?: (campaign: Campaign | CampaignSummary) => void;
  onStartSession?: (campaignId: string) => void;
  onArchive?: (campaignId: string) => void;
  onDuplicate?: (campaignId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  className?: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onDelete,
  onSelect,
  onStartSession,
  onArchive,
  onDuplicate,
  showActions = true,
  compact = false,
  selectable = false,
  selected = false,
  className = "",
}) => {
  const health = CampaignService.getHealthStatus(campaign as Campaign);
  const progress = CampaignService.getProgress(campaign as Campaign);
  const isPlayable = CampaignService.isPlayable(campaign as Campaign);
  const canModify = CampaignService.canModify(campaign as Campaign);

  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect(campaign);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      onDelete &&
      window.confirm(`Sei sicuro di voler eliminare "${campaign.name}"?`)
    ) {
      onDelete(campaign.id);
    }
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      onArchive &&
      window.confirm(`Sei sicuro di voler archiviare "${campaign.name}"?`)
    ) {
      onArchive(campaign.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Status variant mapping
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Planning":
        return "info";
      case "OnHold":
        return "warning";
      case "Completed":
        return "positive";
      case "Archived":
        return "neutral";
      default:
        return "neutral";
    }
  };

  // Health status color
  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "attention":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <BaseCard
      clickable={selectable}
      onClick={handleCardClick}
      size={compact ? "sm" : "md"}
      className={`
        ${!campaign.isActive ? "opacity-75" : ""}
        ${selected ? "ring-2 ring-blue-500 border-blue-500" : ""}
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
              {campaign.name}
            </h3>
            <StatusBadge
              variant={getStatusVariant(campaign.status) as any}
              size="sm"
            >
              {campaign.status === "Active"
                ? "Attiva"
                : campaign.status === "Planning"
                ? "Pianificazione"
                : campaign.status === "OnHold"
                ? "In Pausa"
                : campaign.status === "Completed"
                ? "Completata"
                : "Archiviata"}
            </StatusBadge>

            {/* Health indicator */}
            {!compact && (
              <div className={`text-xs ${getHealthColor(health.status)}`}>
                {health.status === "healthy"
                  ? "✓"
                  : health.status === "warning"
                  ? "⚠"
                  : "⚠"}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
            {campaign.description}
          </p>

          {/* Campaign info */}
          {!compact && "setting" in campaign && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Ambientazione: {campaign.setting}
            </p>
          )}
        </div>

        {showActions && onDelete && canModify && (
          <DeleteButton
            size="xs"
            onClick={handleDeleteClick}
            title="Elimina campagna"
          >
            ✕
          </DeleteButton>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="font-medium text-gray-900 dark:text-white">
            {campaign.currentSession}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Sessione</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="font-medium text-gray-900 dark:text-white">
            {campaign.activeCharacters}
          </div>
          <div className="text-gray-500 dark:text-gray-400">PG Attivi</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="font-medium text-gray-900 dark:text-white">
            {Math.round(campaign.averageLevel)}
          </div>
          <div className="text-gray-500 dark:text-gray-400">Liv. Medio</div>
        </div>
      </div>

      {/* Progress Bars */}
      {!compact && (
        <div className="mb-3 space-y-2">
          {/* Quest Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Quest Completate</span>
              <span>{progress.questCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.questCompletion}%` }}
              />
            </div>
          </div>

          {/* Character Growth */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Crescita Personaggi</span>
              <span>{progress.characterGrowth}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.characterGrowth}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Last Activity */}
      {campaign.lastSessionDate && (
        <div className="mb-3 text-xs text-gray-500 dark:text-gray-500">
          Ultima sessione:{" "}
          {new Date(campaign.lastSessionDate).toLocaleDateString()}
        </div>
      )}

      {/* Health Issues */}
      {!compact && health.issues.length > 0 && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded border-l-2 border-yellow-400">
          <div className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
            Richiede Attenzione:
          </div>
          <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-0.5">
            {health.issues.slice(0, 2).map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
            {health.issues.length > 2 && (
              <li>• +{health.issues.length - 2} altri problemi</li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-1.5">
          {onEdit && canModify && (
            <EditButton
              size="xs"
              onClick={(e) => handleActionClick(e, () => onEdit(campaign))}
            >
              Modifica
            </EditButton>
          )}

          {onStartSession && isPlayable && (
            <CreateButton
              size="xs"
              onClick={(e) =>
                handleActionClick(e, () => onStartSession(campaign.id))
              }
            >
              Nuova Sessione
            </CreateButton>
          )}

          {onDuplicate && (
            <ActionButton
              variant="info"
              size="xs"
              onClick={(e) =>
                handleActionClick(e, () => onDuplicate!(campaign.id))
              }
            >
              Duplica
            </ActionButton>
          )}

          {onArchive && canModify && campaign.status !== "Archived" && (
            <ActionButton
              variant="warning"
              size="xs"
              onClick={handleArchiveClick}
            >
              Archivia
            </ActionButton>
          )}
        </div>
      )}
    </BaseCard>
  );
};

export default CampaignCard;

// Preset variants for different use cases
export const CompactCampaignCard: React.FC<CampaignCardProps> = (props) => (
  <CampaignCard {...props} compact={true} />
);

export const SelectableCampaignCard: React.FC<
  CampaignCardProps & {
    onSelect: (campaign: Campaign | CampaignSummary) => void;
  }
> = ({ onSelect, ...props }) => (
  <CampaignCard
    {...props}
    selectable={true}
    onSelect={onSelect}
    showActions={false}
  />
);

export const CampaignSummaryCard: React.FC<{
  campaign: CampaignSummary;
  onSelect?: (campaign: CampaignSummary) => void;
  selected?: boolean;
}> = ({ campaign, onSelect, selected }) => (
  <CampaignCard
    campaign={campaign}
    onSelect={onSelect}
    selected={selected}
    compact={true}
    selectable={!!onSelect}
    showActions={false}
    className="hover:shadow-md transition-shadow"
  />
);
