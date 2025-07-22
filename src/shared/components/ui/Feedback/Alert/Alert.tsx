import React, { useState } from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";
export type AlertSize = "sm" | "md" | "lg";

export interface AlertAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface AlertProps {
  variant?: AlertVariant;
  size?: AlertSize;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  actions?: AlertAction[];
  className?: string;
  banner?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  variant = "info",
  size = "md",
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  actions,
  className = "",
  banner = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const defaultIcons = {
    info: (
      <svg
        className="dm-alert-icon-svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg
        className="dm-alert-icon-svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="dm-alert-icon-svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    ),
    error: (
      <svg
        className="dm-alert-icon-svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  const alertClasses = [
    "dm-alert",
    `dm-alert-${variant}`,
    `dm-alert-${size}`,
    banner ? "dm-alert-banner" : "dm-alert-inline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={alertClasses} role="alert">
      {/* Icon */}
      <div className="dm-alert-icon">{icon || defaultIcons[variant]}</div>

      {/* Content */}
      <div className="dm-alert-content">
        {title && <div className="dm-alert-title">{title}</div>}
        <div className="dm-alert-message">{children}</div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="dm-alert-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`dm-alert-action dm-alert-action-${
                  action.variant || "primary"
                }`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          className="dm-alert-close"
          onClick={handleDismiss}
          aria-label="Chiudi avviso"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className="dm-alert-close-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;

// Preset Alert components for common D&D scenarios
export interface RuleAlertProps
  extends Omit<AlertProps, "variant" | "title" | "icon"> {
  ruleType: "optional" | "variant" | "homebrew" | "errata";
  ruleName: string;
}

export const RuleAlert: React.FC<RuleAlertProps> = ({
  ruleType,
  ruleName,
  children,
  ...props
}) => {
  const ruleConfig = {
    optional: {
      variant: "info" as AlertVariant,
      title: "Regola Opzionale",
      icon: "📖",
    },
    variant: {
      variant: "warning" as AlertVariant,
      title: "Regola Variante",
      icon: "⚙️",
    },
    homebrew: {
      variant: "info" as AlertVariant,
      title: "Regola Homebrew",
      icon: "🏠",
    },
    errata: {
      variant: "error" as AlertVariant,
      title: "Errata Ufficiale",
      icon: "📝",
    },
  };

  const config = ruleConfig[ruleType];

  return (
    <Alert
      variant={config.variant}
      title={`${config.title}: ${ruleName}`}
      icon={<span className="text-lg">{config.icon}</span>}
      {...props}
    >
      {children}
    </Alert>
  );
};

export interface CombatAlertProps
  extends Omit<AlertProps, "variant" | "title" | "icon"> {
  type: "initiative" | "damage" | "healing" | "condition" | "death";
  character?: string;
}

export const CombatAlert: React.FC<CombatAlertProps> = ({
  type,
  character,
  children,
  ...props
}) => {
  const combatConfig = {
    initiative: {
      variant: "info" as AlertVariant,
      title: "Iniziativa",
      icon: "🎲",
    },
    damage: {
      variant: "error" as AlertVariant,
      title: "Danno Subito",
      icon: "💥",
    },
    healing: {
      variant: "success" as AlertVariant,
      title: "Guarigione",
      icon: "💚",
    },
    condition: {
      variant: "warning" as AlertVariant,
      title: "Condizione Applicata",
      icon: "🌀",
    },
    death: {
      variant: "error" as AlertVariant,
      title: "Tiri Salvezza Morte",
      icon: "💀",
    },
  };

  const config = combatConfig[type];
  const fullTitle = character ? `${config.title} - ${character}` : config.title;

  return (
    <Alert
      variant={config.variant}
      title={fullTitle}
      icon={<span className="text-lg">{config.icon}</span>}
      {...props}
    >
      {children}
    </Alert>
  );
};

export interface QuestAlertProps
  extends Omit<AlertProps, "variant" | "title" | "icon"> {
  status: "new" | "progress" | "completed" | "failed";
  questName: string;
}

export const QuestAlert: React.FC<QuestAlertProps> = ({
  status,
  questName,
  children,
  ...props
}) => {
  const questConfig = {
    new: {
      variant: "info" as AlertVariant,
      title: "Nuova Quest",
      icon: "📜",
    },
    progress: {
      variant: "warning" as AlertVariant,
      title: "Quest in Corso",
      icon: "🔄",
    },
    completed: {
      variant: "success" as AlertVariant,
      title: "Quest Completata",
      icon: "✅",
    },
    failed: {
      variant: "error" as AlertVariant,
      title: "Quest Fallita",
      icon: "❌",
    },
  };

  const config = questConfig[status];

  return (
    <Alert
      variant={config.variant}
      title={`${config.title}: ${questName}`}
      icon={<span className="text-lg">{config.icon}</span>}
      {...props}
    >
      {children}
    </Alert>
  );
};

export interface SystemAlertProps
  extends Omit<AlertProps, "variant" | "title" | "icon"> {
  type: "update" | "maintenance" | "error" | "tip";
}

export const SystemAlert: React.FC<SystemAlertProps> = ({
  type,
  children,
  ...props
}) => {
  const systemConfig = {
    update: {
      variant: "info" as AlertVariant,
      title: "Aggiornamento Disponibile",
      icon: "🔄",
    },
    maintenance: {
      variant: "warning" as AlertVariant,
      title: "Manutenzione Programmata",
      icon: "🔧",
    },
    error: {
      variant: "error" as AlertVariant,
      title: "Errore di Sistema",
      icon: "⚠️",
    },
    tip: {
      variant: "info" as AlertVariant,
      title: "Suggerimento",
      icon: "💡",
    },
  };

  const config = systemConfig[type];

  return (
    <Alert
      variant={config.variant}
      title={config.title}
      icon={<span className="text-lg">{config.icon}</span>}
      dismissible={type === "tip"}
      {...props}
    >
      {children}
    </Alert>
  );
};
