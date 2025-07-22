import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface ToastData {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  persistent?: boolean;
  dismissible?: boolean;
  action?: ToastAction;
  icon?: React.ReactNode;
  onDismiss?: () => void;
}

export interface ToastProps extends Omit<ToastData, "id"> {
  onClose: () => void;
  isVisible: boolean;
}

export interface ToastContextValue {
  toasts: ToastData[];
  show: (toast: Omit<ToastData, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

// Toast Context
const ToastContext = createContext<ToastContextValue | null>(null);

// Toast reducer
type ToastAction_Reducer =
  | { type: "ADD_TOAST"; payload: ToastData }
  | { type: "REMOVE_TOAST"; payload: string }
  | { type: "CLEAR_ALL" };

const toastReducer = (
  state: ToastData[],
  action: ToastAction_Reducer
): ToastData[] => {
  switch (action.type) {
    case "ADD_TOAST":
      return [...state, action.payload];
    case "REMOVE_TOAST":
      return state.filter((toast) => toast.id !== action.payload);
    case "CLEAR_ALL":
      return [];
    default:
      return state;
  }
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Toast Component
const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant,
  dismissible = true,
  action,
  icon,
  onClose,
  isVisible,
}) => {
  const defaultIcons = {
    info: "📋",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  const toastClasses = [
    "dm-toast",
    `dm-toast-${variant}`,
    isVisible ? "dm-toast-visible" : "dm-toast-hidden",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={toastClasses} role="alert" aria-live="polite">
      {/* Icon */}
      <div className="dm-toast-icon">{icon || defaultIcons[variant]}</div>

      {/* Content */}
      <div className="dm-toast-content">
        {title && <div className="dm-toast-title">{title}</div>}
        <div className="dm-toast-message">{message}</div>

        {/* Action */}
        {action && (
          <button
            className={`dm-toast-action dm-toast-action-${
              action.variant || "primary"
            }`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      {dismissible && (
        <button
          className="dm-toast-close"
          onClick={onClose}
          aria-label="Chiudi notifica"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Toast Container
const ToastContainer: React.FC<{ position: ToastPosition }> = ({
  position,
}) => {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, dismiss } = context;

  const containerClasses = [
    "dm-toast-container",
    `dm-toast-container-${position}`,
  ].join(" ");

  return (
    <div className={containerClasses}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => dismiss(toast.id)}
          isVisible={true}
        />
      ))}
    </div>
  );
};

// Toast Provider
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "top-right",
  maxToasts = 5,
  defaultDuration = 5000,
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const show = useCallback(
    (toastData: Omit<ToastData, "id">): string => {
      const id = generateId();
      const toast: ToastData = {
        id,
        duration: defaultDuration,
        dismissible: true,
        persistent: false,
        ...toastData,
      };

      dispatch({ type: "ADD_TOAST", payload: toast });

      // Auto-dismiss if not persistent
      if (!toast.persistent && toast.duration && toast.duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, toast.duration);
      }

      // Remove oldest if exceeding maxToasts
      if (toasts.length >= maxToasts) {
        const oldestId = toasts[0]?.id;
        if (oldestId) {
          setTimeout(() => dismiss(oldestId), 100);
        }
      }

      return id;
    },
    [toasts.length, maxToasts, defaultDuration]
  );

  const dismiss = useCallback(
    (id: string) => {
      const toast = toasts.find((t) => t.id === id);
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      dispatch({ type: "REMOVE_TOAST", payload: id });
    },
    [toasts]
  );

  const dismissAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    show,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position} />
    </ToastContext.Provider>
  );
};

// useToast hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { show, dismiss, dismissAll } = context;

  // Convenience methods
  const toast = {
    success: (
      message: string,
      options?: Partial<Omit<ToastData, "id" | "variant" | "message">>
    ) => show({ message, variant: "success", ...options }),

    error: (
      message: string,
      options?: Partial<Omit<ToastData, "id" | "variant" | "message">>
    ) => show({ message, variant: "error", ...options }),

    warning: (
      message: string,
      options?: Partial<Omit<ToastData, "id" | "variant" | "message">>
    ) => show({ message, variant: "warning", ...options }),

    info: (
      message: string,
      options?: Partial<Omit<ToastData, "id" | "variant" | "message">>
    ) => show({ message, variant: "info", ...options }),

    custom: (data: Omit<ToastData, "id">) => show(data),

    dismiss,
    dismissAll,
  };

  return toast;
};

export default Toast;

// Preset toast functions for common D&D scenarios
export const useD3DToast = () => {
  const toast = useToast();

  return {
    ...toast,

    // Character actions
    characterCreated: (name: string) =>
      toast.success(`Personaggio "${name}" creato con successo!`, {
        title: "Personaggio Creato",
        icon: "🎭",
      }),

    characterLevelUp: (name: string, level: number) =>
      toast.success(`${name} è salito al livello ${level}!`, {
        title: "Level Up!",
        icon: "⭐",
        duration: 7000,
      }),

    // Combat actions
    combatStarted: () =>
      toast.info("Iniziativa lanciata! Il combattimento è iniziato.", {
        title: "Combattimento",
        icon: "⚔️",
      }),

    criticalHit: (character: string) =>
      toast.success(`${character} ha fatto un colpo critico!`, {
        title: "Colpo Critico!",
        icon: "🎯",
        duration: 4000,
      }),

    characterDown: (name: string) =>
      toast.error(`${name} è caduto a 0 punti ferita!`, {
        title: "Personaggio K.O.",
        icon: "💀",
        persistent: true,
        action: {
          label: "Stabilizza",
          onClick: () => toast.info(`${name} è stato stabilizzato.`),
        },
      }),

    // Campaign actions
    questCompleted: (questName: string) =>
      toast.success(`Quest "${questName}" completata!`, {
        title: "Quest Completata",
        icon: "🏆",
        duration: 8000,
      }),

    // System actions
    dataSaved: () =>
      toast.success("Dati salvati correttamente.", {
        icon: "💾",
        duration: 3000,
      }),

    dataError: (action: string) =>
      toast.error(`Errore durante ${action}. Riprova.`, {
        title: "Errore",
        icon: "⚠️",
        action: {
          label: "Riprova",
          onClick: () => window.location.reload(),
        },
      }),

    // Dice rolls
    naturalTwenty: (character?: string) =>
      toast.success(
        character
          ? `${character} ha fatto 20 naturale!`
          : "Tiro da 20 naturale!",
        {
          title: "Critico!",
          icon: "🎲",
          duration: 5000,
        }
      ),

    naturalOne: (character?: string) =>
      toast.warning(
        character
          ? `${character} ha fatto 1 naturale...`
          : "Tiro da 1 naturale...",
        {
          title: "Fallimento Critico",
          icon: "💥",
          duration: 5000,
        }
      ),
  };
};
