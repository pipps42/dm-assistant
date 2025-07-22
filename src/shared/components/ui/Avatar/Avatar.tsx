import React, { useState } from "react";

// ================================================================
// TYPES AND INTERFACES
// ================================================================

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  initials?: string;
  icon?: React.ReactNode;
  size?: AvatarSize;
  variant?: AvatarVariant;
  status?: AvatarStatus;
  showStatus?: boolean;
  square?: boolean;
  bordered?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  size?: AvatarSize;
  max?: number;
  spacing?: "tight" | "normal" | "loose";
  className?: string;
}

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColors = (name: string, variant: AvatarVariant) => {
  if (variant !== "default") return "";

  // Generate consistent colors based on name
  const colors = [
    "primary",
    "success",
    "warning",
    "error",
    "info",
    "purple",
    "pink",
    "cyan",
  ];

  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colorIndex = Math.abs(hash) % colors.length;
  return `dm-avatar-color-${colors[colorIndex]}`;
};

// ================================================================
// MAIN AVATAR COMPONENT
// ================================================================

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = "",
  initials,
  icon,
  size = "md",
  variant = "default",
  status,
  showStatus = false,
  square = false,
  bordered = false,
  clickable = false,
  onClick,
  className = "",
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  // Determine what to display
  const shouldShowImage = src && !imageError;
  const displayInitials = initials || (name ? getInitials(name) : "");
  const displayAlt = alt || name || "Avatar";

  const avatarClasses = [
    "dm-avatar",
    `dm-avatar-${size}`,
    `dm-avatar-${variant}`,
    variant === "default" && name ? getAvatarColors(name, variant) : "",
    square ? "dm-avatar-square" : "",
    bordered ? "dm-avatar-bordered" : "",
    clickable ? "dm-avatar-clickable" : "",
    showStatus && status ? `dm-avatar-status-${status}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const AvatarElement = clickable ? "button" : "div";

  return (
    <AvatarElement
      className={avatarClasses}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      type={clickable ? "button" : undefined}
      aria-label={clickable ? `Avatar for ${displayAlt}` : undefined}
    >
      {/* Image */}
      {shouldShowImage && (
        <img
          src={src}
          alt={displayAlt}
          className="dm-avatar-image"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {/* Fallback content */}
      {!shouldShowImage && (
        <div className="dm-avatar-fallback">
          {icon ? (
            <span className="dm-avatar-icon">{icon}</span>
          ) : displayInitials ? (
            <span className="dm-avatar-initials">{displayInitials}</span>
          ) : (
            <span className="dm-avatar-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zM8 9a5 5 0 00-4.546 2.916A5.986 5.986 0 008 14a5.986 5.986 0 004.546-2.084A5 5 0 008 9z" />
              </svg>
            </span>
          )}
        </div>
      )}

      {/* Status indicator */}
      {showStatus && status && (
        <div className={`dm-avatar-status dm-avatar-status-${status}`} />
      )}
    </AvatarElement>
  );
};

export default Avatar;

// ================================================================
// AVATAR GROUP COMPONENT
// ================================================================

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  size = "md",
  max = 5,
  spacing = "normal",
  className = "",
}) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const extraCount = Math.max(0, avatars.length - max);

  const groupClasses = [
    "dm-avatar-group",
    `dm-avatar-group-${size}`,
    `dm-avatar-group-spacing-${spacing}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={groupClasses}>
      {/* Visible avatars */}
      {visibleAvatars.map((avatar, index) => {
        if (React.isValidElement(avatar)) {
          return React.cloneElement(avatar, {
            key: index,
            size: size,
            className: `${avatar.props.className || ""} dm-avatar-group-item`,
          } as any);
        }
        return avatar;
      })}

      {/* Extra count indicator */}
      {extraCount > 0 && (
        <div className={`dm-avatar dm-avatar-${size} dm-avatar-extra`}>
          <div className="dm-avatar-fallback">
            <span className="dm-avatar-initials">+{extraCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};
