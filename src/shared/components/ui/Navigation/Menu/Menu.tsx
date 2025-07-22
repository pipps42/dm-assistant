import React, { createContext, useContext, useRef, useEffect } from "react";

export type MenuPosition =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"
  | "left-start"
  | "right-start";
export type MenuVariant = "default" | "context";

export interface MenuItemData {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  href?: string;
  isDisabled?: boolean;
  isDanger?: boolean;
  children?: MenuItemData[];
}

export interface MenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  variant: MenuVariant;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

export interface MenuProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: MenuVariant;
  className?: string;
}

export interface MenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export interface MenuContentProps {
  children: React.ReactNode;
  position?: MenuPosition;
  className?: string;
  sideOffset?: number;
}

export interface MenuItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  href?: string;
  isDisabled?: boolean;
  isDanger?: boolean;
  className?: string;
}

export interface MenuSeparatorProps {
  className?: string;
}

export interface MenuGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

// ================================================================
// MENU CONTEXT
// ================================================================

const MenuContext = createContext<MenuContextValue | null>(null);

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a Menu component");
  }
  return context;
};

// ================================================================
// MAIN MENU COMPONENT
// ================================================================

const Menu: React.FC<MenuProps> = ({
  children,
  isOpen: controlledOpen,
  onOpenChange,
  variant = "default",
  className = "",
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(open);
      }
      onOpenChange?.(open);
    },
    [controlledOpen, onOpenChange]
  );

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(target) &&
        !contentRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  const menuClasses = ["dm-menu", `dm-menu-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const contextValue: MenuContextValue = {
    isOpen,
    setIsOpen,
    variant,
    triggerRef,
    contentRef,
  };

  return (
    <MenuContext.Provider value={contextValue}>
      <div className={menuClasses}>{children}</div>
    </MenuContext.Provider>
  );
};

export default Menu;

// ================================================================
// MENU TRIGGER COMPONENT
// ================================================================

export const MenuTrigger: React.FC<MenuTriggerProps> = ({
  children,
  asChild = false,
  className = "",
}) => {
  const { isOpen, setIsOpen, triggerRef } = useMenu();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const triggerClasses = ["dm-menu-trigger", className]
    .filter(Boolean)
    .join(" ");

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      "aria-expanded": isOpen,
      "aria-haspopup": "menu",
    } as any);
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      className={triggerClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      type="button"
    >
      {children}
    </button>
  );
};

// ================================================================
// MENU CONTENT COMPONENT
// ================================================================

export const MenuContent: React.FC<MenuContentProps> = ({
  children,
  position = "bottom-start",
  className = "",
  sideOffset = 4,
}) => {
  const { isOpen, contentRef } = useMenu();

  if (!isOpen) {
    return null;
  }

  const contentClasses = [
    "dm-menu-content",
    `dm-menu-content-${position}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={contentRef}
      className={contentClasses}
      role="menu"
      aria-orientation="vertical"
      style={{ "--menu-side-offset": `${sideOffset}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

// ================================================================
// MENU ITEM COMPONENT
// ================================================================

export const MenuItem: React.FC<MenuItemProps> = ({
  children,
  icon,
  shortcut,
  onClick,
  href,
  isDisabled = false,
  isDanger = false,
  className = "",
}) => {
  const { setIsOpen } = useMenu();

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (onClick) {
        onClick();
        setIsOpen(false);
      }
    }
  };

  const itemClasses = [
    "dm-menu-item",
    isDisabled ? "dm-menu-item-disabled" : "",
    isDanger ? "dm-menu-item-danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const ItemContent = (
    <>
      {/* Icon */}
      {icon && <span className="dm-menu-item-icon">{icon}</span>}

      {/* Label */}
      <span className="dm-menu-item-label">{children}</span>

      {/* Shortcut */}
      {shortcut && <span className="dm-menu-item-shortcut">{shortcut}</span>}
    </>
  );

  if (href && !isDisabled) {
    return (
      <a
        href={href}
        className={itemClasses}
        role="menuitem"
        aria-disabled={isDisabled}
        onClick={() => setIsOpen(false)}
      >
        {ItemContent}
      </a>
    );
  }

  return (
    <div
      className={itemClasses}
      role="menuitem"
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {ItemContent}
    </div>
  );
};

// ================================================================
// MENU SEPARATOR COMPONENT
// ================================================================

export const MenuSeparator: React.FC<MenuSeparatorProps> = ({
  className = "",
}) => {
  return (
    <hr
      className={`dm-menu-separator ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  );
};

// ================================================================
// MENU GROUP COMPONENT
// ================================================================

export const MenuGroup: React.FC<MenuGroupProps> = ({
  children,
  label,
  className = "",
}) => {
  const groupClasses = ["dm-menu-group", className].filter(Boolean).join(" ");

  return (
    <div className={groupClasses} role="group" aria-label={label}>
      {label && <div className="dm-menu-group-label">{label}</div>}
      {children}
    </div>
  );
};
