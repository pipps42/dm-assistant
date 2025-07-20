import React, { forwardRef } from "react";

export type CardVariant =
  | "default"
  | "elevated"
  | "outlined"
  | "ghost"
  | "interactive";
export type CardSize = "sm" | "md" | "lg";

export interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
  hover?: boolean;
  padding?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  imagePosition?: "top" | "left" | "right";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      size = "md",
      children,
      className = "",
      clickable = false,
      onClick,
      hover = true,
      padding = true,
      header,
      footer,
      image,
      imageAlt = "",
      imagePosition = "top",
    },
    ref
  ) => {
    // CSS classes using design system
    const cardClasses = [
      "card-base", // Base class from globals.css
      "transition-normal", // Transition utility
      `dm-card-${size}`,
      `dm-card-${variant}`,
      clickable ? "dm-card-clickable" : "",
      hover && !clickable ? "dm-card-hover" : "",
      padding ? `dm-card-padding-${size}` : "dm-card-no-padding",
      image ? `dm-card-with-image dm-card-image-${imagePosition}` : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const CardContent = () => (
      <>
        {/* Image */}
        {image && imagePosition === "top" && (
          <div className="dm-card-image-container dm-card-image-top">
            <img src={image} alt={imageAlt} className="dm-card-image" />
          </div>
        )}

        <div
          className={`dm-card-content ${
            image && imagePosition !== "top"
              ? "dm-card-content-with-side-image"
              : ""
          }`}
        >
          {/* Side image (left/right) */}
          {image && imagePosition === "left" && (
            <div className="dm-card-image-container dm-card-image-left">
              <img src={image} alt={imageAlt} className="dm-card-image" />
            </div>
          )}

          <div className="dm-card-main">
            {/* Header */}
            {header && <div className="dm-card-header">{header}</div>}

            {/* Body */}
            <div className="dm-card-body">{children}</div>

            {/* Footer */}
            {footer && <div className="dm-card-footer">{footer}</div>}
          </div>

          {/* Right side image */}
          {image && imagePosition === "right" && (
            <div className="dm-card-image-container dm-card-image-right">
              <img src={image} alt={imageAlt} className="dm-card-image" />
            </div>
          )}
        </div>
      </>
    );

    if (clickable && onClick) {
      return (
        <div
          ref={ref}
          className={cardClasses}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }}
          aria-label={typeof header === "string" ? header : undefined}
        >
          <CardContent />
        </div>
      );
    }

    return (
      <div ref={ref} className={cardClasses}>
        <CardContent />
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;

// Specialized Card components for common use cases

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  status?: "new" | "coming-soon" | "beta";
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  action,
  onClick,
  disabled = false,
  status,
  className,
}) => (
  <Card
    variant={disabled ? "ghost" : "interactive"}
    clickable={!!onClick && !disabled}
    onClick={onClick}
    className={`dm-feature-card ${
      disabled ? "dm-feature-card-disabled" : ""
    } ${className}`}
    header={
      <div className="dm-feature-card-header">
        <div className="dm-feature-card-icon">{icon}</div>
        <div className="dm-feature-card-title-area">
          <h3 className="dm-feature-card-title">{title}</h3>
          {status && (
            <span
              className={`dm-feature-card-status dm-feature-card-status-${status}`}
            >
              {status === "new"
                ? "Nuovo!"
                : status === "coming-soon"
                ? "Prossimamente"
                : "Beta"}
            </span>
          )}
        </div>
      </div>
    }
    footer={action}
  >
    <p className="dm-feature-card-description">{description}</p>
  </Card>
);

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className,
}) => (
  <Card variant="elevated" size="sm" className={`dm-stats-card ${className}`}>
    <div className="dm-stats-card-content">
      <div className="dm-stats-card-header">
        <div className="dm-stats-card-title">{title}</div>
        {icon && <div className="dm-stats-card-icon">{icon}</div>}
      </div>

      <div className="dm-stats-card-value">{value}</div>

      {(subtitle || (trend && trendValue)) && (
        <div className="dm-stats-card-footer">
          {subtitle && <div className="dm-stats-card-subtitle">{subtitle}</div>}
          {trend && trendValue && (
            <div className={`dm-stats-card-trend dm-stats-card-trend-${trend}`}>
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
            </div>
          )}
        </div>
      )}
    </div>
  </Card>
);

export interface ImageCardProps {
  image: string;
  imageAlt: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  imageAlt,
  title,
  description,
  action,
  onClick,
  className,
}) => (
  <Card
    variant="interactive"
    image={image}
    imageAlt={imageAlt}
    imagePosition="top"
    clickable={!!onClick}
    onClick={onClick}
    className={`dm-image-card ${className}`}
    header={<h3 className="dm-image-card-title">{title}</h3>}
    footer={action}
  >
    {description && <p className="dm-image-card-description">{description}</p>}
  </Card>
);

// D&D specific card components

export interface ToolCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  status?: "new" | "coming-soon" | "beta";
  category?: string;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  name,
  description,
  icon,
  onClick,
  disabled = false,
  status,
  category,
  className,
}) => (
  <FeatureCard
    title={name}
    description={description}
    icon={icon}
    onClick={onClick}
    disabled={disabled}
    status={status}
    className={`dm-tool-card ${
      category ? `dm-tool-card-${category}` : ""
    } ${className}`}
  />
);

export interface CharacterPreviewCardProps {
  name: string;
  race: string;
  class: string;
  level: number;
  hp: number;
  isActive: boolean;
  onClick?: () => void;
  className?: string;
}

export const CharacterPreviewCard: React.FC<CharacterPreviewCardProps> = ({
  name,
  race,
  class: characterClass,
  level,
  hp,
  isActive,
  onClick,
  className,
}) => (
  <Card
    variant="interactive"
    size="sm"
    clickable={!!onClick}
    onClick={onClick}
    className={`dm-character-preview-card ${
      !isActive ? "dm-character-preview-card-inactive" : ""
    } ${className}`}
    header={
      <div className="dm-character-preview-header">
        <h4 className="dm-character-preview-name">{name}</h4>
        <div
          className={`dm-character-preview-status ${
            isActive ? "active" : "inactive"
          }`}
        >
          {isActive ? "●" : "○"}
        </div>
      </div>
    }
  >
    <div className="dm-character-preview-details">
      <div className="dm-character-preview-info">
        {race} {characterClass}
      </div>
      <div className="dm-character-preview-stats">
        <span className="dm-character-preview-level">Lv. {level}</span>
        <span className="dm-character-preview-hp">{hp} HP</span>
      </div>
    </div>
  </Card>
);

export interface CampaignCardProps {
  name: string;
  description?: string;
  playerCount: number;
  lastPlayed?: string;
  isActive?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  className?: string;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  name,
  description,
  playerCount,
  lastPlayed,
  isActive = false,
  onClick,
  onEdit,
  className,
}) => (
  <Card
    variant="interactive"
    clickable={!!onClick}
    onClick={onClick}
    className={`dm-campaign-card ${
      isActive ? "dm-campaign-card-active" : ""
    } ${className}`}
    header={
      <div className="dm-campaign-card-header">
        <h3 className="dm-campaign-card-name">{name}</h3>
        {isActive && (
          <span className="dm-campaign-card-active-badge">Attiva</span>
        )}
      </div>
    }
    footer={
      <div className="dm-campaign-card-footer">
        <div className="dm-campaign-card-meta">
          <span>{playerCount} giocatori</span>
          {lastPlayed && <span>Ultima sessione: {lastPlayed}</span>}
        </div>
        {onEdit && (
          <button
            type="button"
            className="dm-campaign-card-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            ⚙️
          </button>
        )}
      </div>
    }
  >
    {description && (
      <p className="dm-campaign-card-description">{description}</p>
    )}
  </Card>
);
