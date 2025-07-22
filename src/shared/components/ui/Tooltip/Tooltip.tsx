import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";

export type TooltipPosition =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export type TooltipVariant = "default" | "dark" | "light";

export interface TooltipContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  delay: number;
}

export interface TooltipProviderProps {
  children: React.ReactNode;
  delay?: number;
}

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
  showArrow?: boolean;
  className?: string;
}

export interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export interface TooltipContentProps {
  children: React.ReactNode;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  showArrow?: boolean;
  className?: string;
  sideOffset?: number;
}

// ================================================================
// TOOLTIP CONTEXT
// ================================================================

const TooltipContext = createContext<TooltipContextValue | null>(null);

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
};

// ================================================================
// TOOLTIP PROVIDER COMPONENT
// ================================================================

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delay = 700,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const contextValue: TooltipContextValue = {
    isOpen,
    setIsOpen,
    triggerRef,
    contentRef,
    delay,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
};

// ================================================================
// SIMPLE TOOLTIP COMPONENT (WRAPPER)
// ================================================================

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  variant = "default",
  delay = 700,
  disabled = false,
  showArrow = true,
  className = "",
}) => {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delay={delay}>
      <div className={`dm-tooltip-wrapper ${className}`}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          position={position}
          variant={variant}
          showArrow={showArrow}
        >
          {content}
        </TooltipContent>
      </div>
    </TooltipProvider>
  );
};

export default Tooltip;

// ================================================================
// TOOLTIP TRIGGER COMPONENT
// ================================================================

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
  children,
  asChild = false,
  className = "",
}) => {
  const { setIsOpen, triggerRef, delay } = useTooltip();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  const handleFocus = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleBlur = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const triggerProps = {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: `dm-tooltip-trigger ${className}`,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...triggerProps,
      className: `${children.props.className || ""} ${triggerProps.className}`,
    } as any);
  }

  return <span {...triggerProps}>{children}</span>;
};

// ================================================================
// TOOLTIP CONTENT COMPONENT
// ================================================================

export const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  position = "top",
  variant = "default",
  showArrow = true,
  className = "",
  sideOffset = 8,
}) => {
  const { isOpen, contentRef } = useTooltip();

  if (!isOpen) {
    return null;
  }

  const contentClasses = [
    "dm-tooltip-content",
    `dm-tooltip-content-${position}`,
    `dm-tooltip-content-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={contentRef}
      className={contentClasses}
      role="tooltip"
      style={
        { "--tooltip-side-offset": `${sideOffset}px` } as React.CSSProperties
      }
    >
      {/* Arrow */}
      {showArrow && (
        <div className={`dm-tooltip-arrow dm-tooltip-arrow-${position}`} />
      )}

      {/* Content */}
      <div className="dm-tooltip-inner">{children}</div>
    </div>
  );
};
