import React, { createContext, useContext } from "react";

export type SidebarSize = "sm" | "md" | "lg";
export type SidebarVariant = "default" | "compact" | "minimal";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  badge?: string | number;
  children?: SidebarNavItem[];
}

export interface SidebarNavGroup {
  id: string;
  label?: string;
  items: SidebarNavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface SidebarContextValue {
  collapsed?: boolean;
  size: SidebarSize;
  variant: SidebarVariant;
}

export interface SidebarProps {
  children: React.ReactNode;
  collapsed?: boolean;
  size?: SidebarSize;
  variant?: SidebarVariant;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface SidebarItemProps {
  item: SidebarNavItem;
  level?: number;
  className?: string;
}

export interface SidebarGroupProps {
  group: SidebarNavGroup;
  className?: string;
}

export interface SidebarDividerProps {
  className?: string;
}

// ================================================================
// SIDEBAR CONTEXT
// ================================================================

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar");
  }
  return context;
};

// ================================================================
// MAIN SIDEBAR COMPONENT
// ================================================================

const Sidebar: React.FC<SidebarProps> = ({
  children,
  collapsed = false,
  size = "md",
  variant = "default",
  className = "",
  header,
  footer,
}) => {
  const sidebarClasses = [
    "dm-sidebar",
    `dm-sidebar-${size}`,
    `dm-sidebar-${variant}`,
    collapsed ? "dm-sidebar-collapsed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contextValue: SidebarContextValue = {
    collapsed,
    size,
    variant,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <nav className={sidebarClasses}>
        {/* Header */}
        {header && <div className="dm-sidebar-header">{header}</div>}

        {/* Content */}
        <div className="dm-sidebar-content">{children}</div>

        {/* Footer */}
        {footer && <div className="dm-sidebar-footer">{footer}</div>}
      </nav>
    </SidebarContext.Provider>
  );
};

export default Sidebar;

// ================================================================
// SIDEBAR ITEM COMPONENT
// ================================================================

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  level = 0,
  className = "",
}) => {
  const { collapsed } = useSidebar();
  const hasChildren = item.children && item.children.length > 0;
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const itemClasses = [
    "dm-sidebar-item",
    `dm-sidebar-item-level-${level}`,
    item.isActive ? "dm-sidebar-item-active" : "",
    item.isDisabled ? "dm-sidebar-item-disabled" : "",
    hasChildren ? "dm-sidebar-item-expandable" : "",
    isExpanded ? "dm-sidebar-item-expanded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const ItemContent = (
    <>
      {/* Icon */}
      {item.icon && <span className="dm-sidebar-item-icon">{item.icon}</span>}

      {/* Label */}
      {!collapsed && (
        <span className="dm-sidebar-item-label">{item.label}</span>
      )}

      {/* Badge */}
      {!collapsed && item.badge && (
        <span className="dm-sidebar-item-badge">{item.badge}</span>
      )}

      {/* Expand Icon */}
      {!collapsed && hasChildren && (
        <span
          className={`dm-sidebar-item-expand ${
            isExpanded ? "dm-sidebar-item-expand-open" : ""
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 4l4 4-4 4V4z" />
          </svg>
        </span>
      )}
    </>
  );

  return (
    <div className="dm-sidebar-item-wrapper">
      {/* Main Item */}
      {item.href ? (
        <a
          href={item.href}
          className={itemClasses}
          onClick={
            hasChildren
              ? (e) => {
                  e.preventDefault();
                  handleClick();
                }
              : undefined
          }
          aria-disabled={item.isDisabled}
        >
          {ItemContent}
        </a>
      ) : (
        <button
          className={itemClasses}
          onClick={handleClick}
          disabled={item.isDisabled}
          type="button"
        >
          {ItemContent}
        </button>
      )}

      {/* Children Items */}
      {!collapsed && hasChildren && isExpanded && (
        <div className="dm-sidebar-item-children">
          {item.children?.map((child) => (
            <SidebarItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ================================================================
// SIDEBAR GROUP COMPONENT
// ================================================================

export const SidebarGroup: React.FC<SidebarGroupProps> = ({
  group,
  className = "",
}) => {
  const { collapsed } = useSidebar();
  const [isOpen, setIsOpen] = React.useState(group.defaultOpen ?? true);

  const groupClasses = [
    "dm-sidebar-group",
    isOpen ? "dm-sidebar-group-open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggle = () => {
    if (group.collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={groupClasses}>
      {/* Group Label */}
      {!collapsed && group.label && (
        <div
          className={`dm-sidebar-group-label ${
            group.collapsible ? "dm-sidebar-group-label-clickable" : ""
          }`}
          onClick={group.collapsible ? handleToggle : undefined}
        >
          <span className="dm-sidebar-group-label-text">{group.label}</span>
          {group.collapsible && (
            <span
              className={`dm-sidebar-group-expand ${
                isOpen ? "dm-sidebar-group-expand-open" : ""
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
              >
                <path d="M3.5 5.25l3.5 3.5 3.5-3.5L3.5 5.25z" />
              </svg>
            </span>
          )}
        </div>
      )}

      {/* Group Items */}
      {(isOpen || collapsed) && (
        <div className="dm-sidebar-group-items">
          {group.items.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

// ================================================================
// SIDEBAR DIVIDER COMPONENT
// ================================================================

export const SidebarDivider: React.FC<SidebarDividerProps> = ({
  className = "",
}) => {
  return <hr className={`dm-sidebar-divider ${className}`} />;
};
