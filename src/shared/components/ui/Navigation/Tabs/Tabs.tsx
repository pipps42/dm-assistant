import React, { createContext, useContext, useCallback } from "react";

export type TabsVariant = "default" | "secondary" | "pills";
export type TabsSize = "sm" | "md" | "lg";
export type TabsOrientation = "horizontal" | "vertical";

export interface TabItem {
  id: string;
  label: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  isDisabled?: boolean;
}

export interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
}

export interface TabsProps {
  children: React.ReactNode;
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  className?: string;
}

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export interface TabProps {
  id: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  isDisabled?: boolean;
  className?: string;
}

export interface TabsContentProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

// ================================================================
// TABS CONTEXT
// ================================================================

const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a Tabs component");
  }
  return context;
};

// ================================================================
// MAIN TABS COMPONENT
// ================================================================

const Tabs: React.FC<TabsProps> = ({
  children,
  defaultTab,
  activeTab,
  onTabChange,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  className = "",
}) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(
    defaultTab || ""
  );

  // Use controlled or uncontrolled state
  const currentActiveTab =
    activeTab !== undefined ? activeTab : internalActiveTab;

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (activeTab === undefined) {
        setInternalActiveTab(tabId);
      }
      onTabChange?.(tabId);
    },
    [activeTab, onTabChange]
  );

  const tabsClasses = [
    "dm-tabs",
    `dm-tabs-${variant}`,
    `dm-tabs-${size}`,
    `dm-tabs-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contextValue: TabsContextValue = {
    activeTab: currentActiveTab,
    setActiveTab: handleTabChange,
    variant,
    size,
    orientation,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={tabsClasses}
        role="tablist"
        aria-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export default Tabs;

// ================================================================
// TABS LIST COMPONENT
// ================================================================

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className = "",
}) => {
  const { orientation } = useTabs();

  const listClasses = ["dm-tabs-list", `dm-tabs-list-${orientation}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={listClasses} role="none">
      {children}
    </div>
  );
};

// ================================================================
// TAB COMPONENT
// ================================================================

export const Tab: React.FC<TabProps> = ({
  id,
  children,
  icon,
  badge,
  isDisabled = false,
  className = "",
}) => {
  const { activeTab, setActiveTab, size } = useTabs();
  const isActive = activeTab === id;

  const handleClick = () => {
    if (!isDisabled) {
      setActiveTab(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setActiveTab(id);
    }
  };

  const tabClasses = [
    "dm-tab",
    `dm-tab-${size}`,
    isActive ? "dm-tab-active" : "",
    isDisabled ? "dm-tab-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={tabClasses}
      role="tab"
      aria-selected={isActive}
      aria-disabled={isDisabled}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      type="button"
    >
      {/* Icon */}
      {icon && <span className="dm-tab-icon">{icon}</span>}

      {/* Label */}
      <span className="dm-tab-label">{children}</span>

      {/* Badge */}
      {badge && <span className="dm-tab-badge">{badge}</span>}
    </button>
  );
};

// ================================================================
// TABS CONTENT COMPONENT
// ================================================================

export const TabsContent: React.FC<TabsContentProps> = ({
  id,
  children,
  className = "",
}) => {
  const { activeTab } = useTabs();
  const isActive = activeTab === id;

  const contentClasses = [
    "dm-tabs-content",
    isActive ? "dm-tabs-content-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!isActive) {
    return null;
  }

  return (
    <div
      className={contentClasses}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      id={`panel-${id}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
};
