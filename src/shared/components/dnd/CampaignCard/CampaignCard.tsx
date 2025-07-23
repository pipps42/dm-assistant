import React from "react";
import { Campaign, CampaignStatus } from "@/core/entities/Campaign";
import {
  Card,
  Badge,
  Avatar,
  Progress,
  Button,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@/shared/components/ui";
import { Tooltip } from "@/shared/components/ui";

// ================================================================
// TYPES AND INTERFACES
// ================================================================

export type CampaignCardVariant = "default" | "compact" | "detailed";
export type CampaignCardSize = "sm" | "md" | "lg";

export interface CampaignCardProps {
  campaign: Campaign;
  variant?: CampaignCardVariant;
  size?: CampaignCardSize;
  isActive?: boolean;
  showActions?: boolean;
  className?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onSwitchTo?: () => void;
  onArchive?: () => void;
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

const getStatusBadgeVariant = (status: CampaignStatus) => {
  switch (status) {
    case "Active":
      return "success";
    case "OnHold":
      return "warning";
    case "Completed":
      return "info";
    case "Archived":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusIcon = (status: CampaignStatus) => {
  switch (status) {
    case "Active":
      return "🎲";
    case "OnHold":
      return "⏸️";
    case "Completed":
      return "✅";
    case "Archived":
      return "📦";
    default:
      return "📋";
  }
};

const formatLastPlayed = (date: string | undefined): string => {
  if (!date) return "Never played";

  const lastPlayed = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastPlayed.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

const calculateProgress = (campaign: Campaign): number => {
  if (!campaign.info.totalSessions || campaign.info.totalSessions === 0)
    return 0;
  // Simple progress calculation - could be more sophisticated
  const targetSessions = 20; // Default target
  return Math.min((campaign.info.totalSessions / targetSessions) * 100, 100);
};

// ================================================================
// MAIN CAMPAIGN CARD COMPONENT
// ================================================================

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  variant = "default",
  size = "md",
  isActive = false,
  showActions = true,
  className = "",
  onClick,
  onEdit,
  onDelete,
  onDuplicate,
  onSwitchTo,
  onArchive,
}) => {
  const progress = calculateProgress(campaign);
  const lastPlayedText = formatLastPlayed(campaign.lastSessionDate);

  const cardClasses = [
    "dm-campaign-card",
    `dm-campaign-card-${variant}`,
    `dm-campaign-card-${size}`,
    isActive ? "dm-campaign-card-active" : "",
    onClick ? "dm-campaign-card-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={cardClasses}
      onClick={handleCardClick}
      variant={isActive ? "elevated" : "default"}
    >
      {/* Header */}
      <div className="dm-campaign-card-header">
        {/* Avatar/Icon */}
        <Avatar
          name={campaign.name}
          size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
          variant="primary"
          icon={<span>🎲</span>}
        />

        {/* Title and Status */}
        <div className="dm-campaign-card-title-area">
          <div className="dm-campaign-card-title-row">
            <h3 className="dm-campaign-card-title">
              {campaign.name}
              {isActive && (
                <Tooltip content="Current active campaign">
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                </Tooltip>
              )}
            </h3>

            <div className="dm-campaign-card-status-area">
              <Tooltip content={`Campaign status: ${campaign.status}`}>
                <Badge
                  variant={getStatusBadgeVariant(campaign.status)}
                  icon={<span>{getStatusIcon(campaign.status)}</span>}
                >
                  {campaign.status}
                </Badge>
              </Tooltip>

              {showActions && (
                <Menu>
                  <MenuTrigger>
                    <Button variant="ghost" size="sm" /* icon */>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M3 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM8 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM13 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                      </svg>
                    </Button>
                  </MenuTrigger>
                  <MenuContent>
                    {onSwitchTo && !isActive && (
                      <MenuItem onClick={onSwitchTo} icon={<span>🎯</span>}>
                        Switch to Campaign
                      </MenuItem>
                    )}
                    {onEdit && (
                      <MenuItem onClick={onEdit} icon={<span>✏️</span>}>
                        Edit Campaign
                      </MenuItem>
                    )}
                    {onDuplicate && (
                      <MenuItem onClick={onDuplicate} icon={<span>📋</span>}>
                        Duplicate
                      </MenuItem>
                    )}
                    {onArchive && campaign.status !== "Archived" && (
                      <MenuItem onClick={onArchive} icon={<span>📦</span>}>
                        Archive
                      </MenuItem>
                    )}
                    {onDelete && (
                      <MenuItem
                        onClick={onDelete}
                        icon={<span>🗑️</span>}
                        isDanger
                      >
                        Delete
                      </MenuItem>
                    )}
                  </MenuContent>
                </Menu>
              )}
            </div>
          </div>

          {variant !== "compact" && campaign.description && (
            <p className="dm-campaign-card-description">
              {campaign.description}
            </p>
          )}
        </div>
      </div>

      {/* Content - varies by variant */}
      {variant === "detailed" && (
        <div className="dm-campaign-card-content">
          {/* Stats Row */}
          <div className="dm-campaign-card-stats">
            <div className="dm-campaign-card-stat">
              <span className="dm-campaign-card-stat-label">Sessions</span>
              <span className="dm-campaign-card-stat-value">
                {campaign.info.totalSessions || 0}
              </span>
            </div>
            <div className="dm-campaign-card-stat">
              <span className="dm-campaign-card-stat-label">Level</span>
              <span className="dm-campaign-card-stat-value">
                {campaign.averageLevel || 1}
              </span>
            </div>
            <div className="dm-campaign-card-stat">
              <span className="dm-campaign-card-stat-label">Players</span>
              <span className="dm-campaign-card-stat-value">
                {campaign.activeCharacters || 0}
              </span>
            </div>
          </div>

          {/* Progress */}
          {campaign.status === "Active" && (
            <div className="dm-campaign-card-progress">
              <div className="dm-campaign-card-progress-header">
                <span className="dm-campaign-card-progress-label">
                  Campaign Progress
                </span>
                <span className="dm-campaign-card-progress-value">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {variant !== "compact" && (
        <div className="dm-campaign-card-footer">
          <div className="dm-campaign-card-meta">
            <span className="dm-campaign-card-created">
              Created {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
            <span className="dm-campaign-card-last-played">
              {lastPlayedText}
            </span>
          </div>

          {variant === "default" && campaign.status === "Active" && (
            <div className="dm-campaign-card-quick-actions">
              {onSwitchTo && !isActive && (
                <Button variant="primary" size="sm" onClick={onSwitchTo}>
                  Switch To
                </Button>
              )}
              {isActive && (
                <Button variant="outline" size="sm" disabled>
                  Current Campaign
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default CampaignCard;
