// src/shared/components/dnd/StatusBadge.tsx

import React from "react";

export type StatusBadgeVariant =
  | "level"
  | "active"
  | "inactive"
  | "positive"
  | "negative"
  | "neutral"
  | "warning"
  | "info"
  | "success"
  | "danger";

export interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  children,
  size = "md",
  className = "",
}) => {
  // Base classes for all badges
  const baseClasses =
    "inline-flex items-center font-medium rounded-full border";

  // Size variations
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  // Variant-specific styling (D&D themed)
  const variantClasses = {
    level:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700",
    active:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
    inactive:
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
    positive:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-700",
    negative:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
    neutral:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
    warning:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700",
    info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700",
    success:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700",
    danger:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700",
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].join(" ");

  return <span className={classes}>{children}</span>;
};

export default StatusBadge;

// Utility functions for common D&D statuses
export const LevelBadge: React.FC<{ level: number; className?: string }> = ({
  level,
  className,
}) => (
  <StatusBadge variant="level" className={className}>
    Lv. {level}
  </StatusBadge>
);

export const ActiveStatusBadge: React.FC<{
  isActive: boolean;
  className?: string;
}> = ({ isActive, className }) => (
  <StatusBadge
    variant={isActive ? "active" : "inactive"}
    size="sm"
    className={className}
  >
    {isActive ? "Attivo" : "Inattivo"}
  </StatusBadge>
);

export const RelationshipBadge: React.FC<{
  type:
    | "Friendly"
    | "Hostile"
    | "Neutral"
    | "Suspicious"
    | "Romantic"
    | "Ally"
    | "Enemy"
    | "Respected"
    | "Feared";
  className?: string;
}> = ({ type, className }) => {
  const variantMap: Record<typeof type, StatusBadgeVariant> = {
    Friendly: "positive",
    Ally: "positive",
    Respected: "positive",
    Romantic: "positive",
    Hostile: "negative",
    Enemy: "negative",
    Feared: "negative",
    Suspicious: "warning",
    Neutral: "neutral",
  };

  const labelMap: Record<typeof type, string> = {
    Friendly: "Amichevole",
    Hostile: "Ostile",
    Neutral: "Neutrale",
    Suspicious: "Diffidente",
    Romantic: "Romantico",
    Ally: "Alleato",
    Enemy: "Nemico",
    Respected: "Rispettato",
    Feared: "Temuto",
  };

  return (
    <StatusBadge variant={variantMap[type]} size="sm" className={className}>
      {labelMap[type]}
    </StatusBadge>
  );
};

export const AchievementTypeBadge: React.FC<{
  type:
    | "QuestCompleted"
    | "PuzzleSolved"
    | "SocialInteraction"
    | "CombatVictory"
    | "Discovery"
    | "Roleplay";
  className?: string;
}> = ({ type, className }) => {
  const variantMap: Record<typeof type, StatusBadgeVariant> = {
    QuestCompleted: "success",
    PuzzleSolved: "info",
    SocialInteraction: "positive",
    CombatVictory: "warning",
    Discovery: "info",
    Roleplay: "neutral",
  };

  const labelMap: Record<typeof type, string> = {
    QuestCompleted: "Quest",
    PuzzleSolved: "Enigma",
    SocialInteraction: "Sociale",
    CombatVictory: "Combattimento",
    Discovery: "Scoperta",
    Roleplay: "Roleplay",
  };

  return (
    <StatusBadge variant={variantMap[type]} size="sm" className={className}>
      {labelMap[type]}
    </StatusBadge>
  );
};
