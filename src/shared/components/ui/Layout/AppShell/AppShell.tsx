import React, { createContext, useContext } from "react";

export type AppShellLayout = "default" | "sidebar" | "fullscreen";
export type AppShellSidebarPosition = "left" | "right";

export interface AppShellContextValue {
  layout: AppShellLayout;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
}

export interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  layout?: AppShellLayout;
  sidebarPosition?: AppShellSidebarPosition;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: (collapsed: boolean) => void;
  disablePadding?: boolean;
  className?: string;
}

// AppShell Context for child components
const AppShellContext = createContext<AppShellContextValue | null>(null);

export const useAppShell = () => {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an AppShell");
  }
  return context;
};

const AppShell: React.FC<AppShellProps> = ({
  children,
  header,
  sidebar,
  footer,
  layout = "default",
  sidebarPosition = "left",
  sidebarCollapsed = false,
  onSidebarToggle,
  disablePadding = false,
  className = "",
}) => {
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] =
    React.useState(sidebarCollapsed);

  // Use controlled or uncontrolled sidebar state
  const isCollapsed = onSidebarToggle
    ? sidebarCollapsed
    : internalSidebarCollapsed;
  const setSidebarCollapsed = onSidebarToggle || setInternalSidebarCollapsed;

  // Determine actual layout based on props
  const actualLayout = sidebar ? "sidebar" : layout;

  // CSS classes
  const shellClasses = [
    "dm-appshell",
    `dm-appshell-${actualLayout}`,
    sidebar && `dm-appshell-sidebar-${sidebarPosition}`,
    sidebar && isCollapsed ? "dm-appshell-sidebar-collapsed" : "",
    header ? "dm-appshell-with-header" : "",
    footer ? "dm-appshell-with-footer" : "",
    disablePadding ? "dm-appshell-no-padding" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const contextValue: AppShellContextValue = {
    layout: actualLayout,
    sidebarCollapsed: isCollapsed,
    setSidebarCollapsed,
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className={shellClasses}>
        {/* Header */}
        {header && <header className="dm-appshell-header">{header}</header>}

        {/* Main Content Area */}
        <div className="dm-appshell-body">
          {/* Sidebar */}
          {sidebar && (
            <aside
              className={`dm-appshell-sidebar ${
                isCollapsed ? "dm-appshell-sidebar-collapsed" : ""
              }`}
            >
              <div className="dm-appshell-sidebar-content">{sidebar}</div>
            </aside>
          )}

          {/* Main Content */}
          <main className="dm-appshell-main">
            <div className="dm-appshell-content">{children}</div>
          </main>
        </div>

        {/* Footer */}
        {footer && <footer className="dm-appshell-footer">{footer}</footer>}
      </div>
    </AppShellContext.Provider>
  );
};

export default AppShell;

// Header Component for consistent styling
export interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = "",
  children,
}) => {
  const headerClasses = ["dm-app-header", className].filter(Boolean).join(" ");

  return (
    <div className={headerClasses}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="dm-app-header-breadcrumbs">{breadcrumbs}</div>
      )}

      {/* Main header content */}
      <div className="dm-app-header-main">
        {/* Title area */}
        {(title || subtitle) && (
          <div className="dm-app-header-title-area">
            {title && <h1 className="dm-app-header-title">{title}</h1>}
            {subtitle && <p className="dm-app-header-subtitle">{subtitle}</p>}
          </div>
        )}

        {/* Custom children content */}
        {children && <div className="dm-app-header-content">{children}</div>}

        {/* Actions */}
        {actions && <div className="dm-app-header-actions">{actions}</div>}
      </div>
    </div>
  );
};

// Footer Component for consistent styling
export interface AppFooterProps {
  className?: string;
  children?: React.ReactNode;
  status?: React.ReactNode;
  info?: React.ReactNode;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  className = "",
  children,
  status,
  info,
}) => {
  const footerClasses = ["dm-app-footer", className].filter(Boolean).join(" ");

  return (
    <div className={footerClasses}>
      {/* Status area (left side) */}
      {status && <div className="dm-app-footer-status">{status}</div>}

      {/* Custom content */}
      {children && <div className="dm-app-footer-content">{children}</div>}

      {/* Info area (right side) */}
      {info && <div className="dm-app-footer-info">{info}</div>}
    </div>
  );
};

// Content Container for consistent padding and spacing
export interface AppContentProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centerContent?: boolean;
}

export const AppContent: React.FC<AppContentProps> = ({
  children,
  className = "",
  maxWidth = "full",
  padding = "md",
  centerContent = false,
}) => {
  const contentClasses = [
    "dm-app-content",
    `dm-app-content-${maxWidth}`,
    `dm-app-content-padding-${padding}`,
    centerContent ? "dm-app-content-centered" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={contentClasses}>{children}</div>;
};
