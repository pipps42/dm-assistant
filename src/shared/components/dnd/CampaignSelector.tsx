import React, { useState } from "react";
import { Campaign, CampaignSummary } from "@/core/entities/Campaign";
import { CampaignService } from "@/core/services/CampaignService";
import BaseCard from "../ui/BaseCard";
import StatusBadge from "./StatusBadge";
import ActionButton, { CreateButton } from "./ActionButton";

export interface CampaignSelectorProps {
  campaigns: Campaign[] | CampaignSummary[];
  currentCampaign?: Campaign | null;
  onSelect: (campaign: Campaign | CampaignSummary) => void;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
  showCurrentBadge?: boolean;
  className?: string;
  loading?: boolean;
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  campaigns,
  currentCampaign,
  onSelect,
  onCreateNew,
  showCreateButton = true,
  showCurrentBadge = true,
  className = "",
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter and search campaigns
  const filteredCampaigns = React.useMemo(() => {
    let filtered = [...campaigns];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (campaign) => campaign.status === filterStatus
      );
    }

    // Search by name/description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query)
      );
    }

    // Sort by activity
    return CampaignService.sortByActivity(filtered as Campaign[]);
  }, [campaigns, filterStatus, searchQuery]);

  const statusOptions = [
    { value: "all", label: "Tutte" },
    { value: "Active", label: "Attive" },
    { value: "Planning", label: "In Pianificazione" },
    { value: "OnHold", label: "In Pausa" },
    { value: "Completed", label: "Completate" },
    { value: "Archived", label: "Archiviate" },
  ];

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

  if (loading) {
    return (
      <div className={`campaign-selector ${className}`}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`campaign-selector ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Seleziona Campagna
        </h2>
        {showCreateButton && onCreateNew && (
          <CreateButton size="sm" onClick={onCreateNew}>
            + Nuova Campagna
          </CreateButton>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Cerca campagne..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Campaign List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery || filterStatus !== "all" ? (
              <div>
                <p className="mb-2">Nessuna campagna trovata</p>
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                >
                  Cancella Filtri
                </ActionButton>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">🏰</div>
                <p className="mb-4">Nessuna campagna ancora</p>
                {showCreateButton && onCreateNew && (
                  <CreateButton onClick={onCreateNew}>
                    Crea la tua prima campagna
                  </CreateButton>
                )}
              </div>
            )}
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <CampaignListItem
              key={campaign.id}
              campaign={campaign}
              isCurrentCampaign={
                showCurrentBadge && currentCampaign?.id === campaign.id
              }
              onSelect={() => onSelect(campaign)}
            />
          ))
        )}
      </div>

      {/* Summary Stats */}
      {campaigns.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {campaigns.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Totali</div>
            </div>
            <div>
              <div className="font-medium text-green-600 dark:text-green-400">
                {campaigns.filter((c) => c.status === "Active").length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Attive</div>
            </div>
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {campaigns.filter((c) => c.status === "Completed").length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Completate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal component for campaign list items
interface CampaignListItemProps {
  campaign: Campaign | CampaignSummary;
  isCurrentCampaign: boolean;
  onSelect: () => void;
}

const CampaignListItem: React.FC<CampaignListItemProps> = ({
  campaign,
  isCurrentCampaign,
  onSelect,
}) => {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Active":
        return "Attiva";
      case "Planning":
        return "Pianificazione";
      case "OnHold":
        return "In Pausa";
      case "Completed":
        return "Completata";
      case "Archived":
        return "Archiviata";
      default:
        return status;
    }
  };

  return (
    <BaseCard
      clickable
      onClick={onSelect}
      size="sm"
      className={`
        transition-all duration-200 hover:shadow-md
        ${isCurrentCampaign ? "ring-2 ring-blue-500 border-blue-500" : ""}
        ${!campaign.isActive ? "opacity-75" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {campaign.name}
            </h3>
            {isCurrentCampaign && (
              <StatusBadge variant="info" size="sm">
                Corrente
              </StatusBadge>
            )}
            <StatusBadge
              variant={getStatusVariant(campaign.status) as any}
              size="sm"
            >
              {getStatusLabel(campaign.status)}
            </StatusBadge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {campaign.description}
          </p>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Sessione {campaign.currentSession}</span>
            <span>{campaign.activeCharacters} PG</span>
            <span>Lv. {Math.round(campaign.averageLevel)}</span>
            {campaign.lastSessionDate && (
              <span>
                {new Date(campaign.lastSessionDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="ml-2 text-gray-400 dark:text-gray-500">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </BaseCard>
  );
};

export default CampaignSelector;

// Preset variants
export const CompactCampaignSelector: React.FC<CampaignSelectorProps> = (
  props
) => (
  <div className="w-full max-w-sm">
    <CampaignSelector {...props} />
  </div>
);

export const ModalCampaignSelector: React.FC<
  CampaignSelectorProps & {
    isOpen: boolean;
    onClose: () => void;
  }
> = ({ isOpen, onClose, ...props }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Seleziona Campagna
            </h2>
            <ActionButton variant="secondary" size="sm" onClick={onClose}>
              ✕
            </ActionButton>
          </div>
        </div>
        <div className="p-4 overflow-y-auto">
          <CampaignSelector {...props} showCreateButton={false} />
        </div>
      </div>
    </div>
  );
};
