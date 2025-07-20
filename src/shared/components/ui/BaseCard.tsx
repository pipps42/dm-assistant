// src/shared/components/ui/BaseCard.tsx

import React from "react";

export type BaseCardVariant = "default" | "elevated" | "outlined" | "ghost";
export type BaseCardSize = "sm" | "md" | "lg";

export interface BaseCardProps {
  variant?: BaseCardVariant;
  size?: BaseCardSize;
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
  hover?: boolean;
  padding?: boolean;
}

const BaseCard: React.FC<BaseCardProps> = ({
  variant = "default",
  size = "md",
  children,
  className = "",
  clickable = false,
  onClick,
  hover = true,
  padding = true,
}) => {
  // Base classes - dark mode ready
  const baseClasses = [
    "rounded-lg transition-all duration-200",
    "bg-white dark:bg-gray-800",
    "text-gray-900 dark:text-white",
  ].join(" ");

  // Variant classes
  const variantClasses = {
    default: [
      "border border-gray-200 dark:border-gray-700",
      "shadow-sm",
      hover ? "hover:shadow-md" : "",
    ].join(" "),

    elevated: [
      "border border-gray-100 dark:border-gray-600",
      "shadow-lg",
      hover ? "hover:shadow-xl" : "",
    ].join(" "),

    outlined: [
      "border-2 border-gray-300 dark:border-gray-600",
      "shadow-none",
      hover ? "hover:border-gray-400 dark:hover:border-gray-500" : "",
    ].join(" "),

    ghost: [
      "border-0",
      "shadow-none",
      "bg-transparent dark:bg-transparent",
      hover ? "hover:bg-gray-50 dark:hover:bg-gray-800/50" : "",
    ].join(" "),
  };

  // Size classes
  const sizeClasses = {
    sm: padding ? "p-3" : "",
    md: padding ? "p-4" : "",
    lg: padding ? "p-6" : "",
  };

  // Interactive classes
  const interactiveClasses = [
    clickable ? "cursor-pointer" : "",
    clickable && hover ? "hover:scale-[1.02] active:scale-[0.98]" : "",
  ].join(" ");

  const allClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    interactiveClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={allClasses}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default BaseCard;

// Preset variants per casi comuni
export const ElevatedCard: React.FC<Omit<BaseCardProps, "variant">> = (
  props
) => <BaseCard variant="elevated" {...props} />;

export const OutlinedCard: React.FC<Omit<BaseCardProps, "variant">> = (
  props
) => <BaseCard variant="outlined" {...props} />;

export const ClickableCard: React.FC<Omit<BaseCardProps, "clickable">> = (
  props
) => <BaseCard clickable={true} {...props} />;

export const GhostCard: React.FC<Omit<BaseCardProps, "variant">> = (props) => (
  <BaseCard variant="ghost" {...props} />
);
