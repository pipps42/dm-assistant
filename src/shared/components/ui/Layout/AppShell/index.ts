// Import CSS styles
import "./AppShell.css";

// Main AppShell component and hook
export { default as AppShell, useAppShell } from "./AppShell";

// Sub-components
export { AppHeader, AppFooter, AppContent } from "./AppShell";

// TypeScript interfaces and types
export type {
  AppShellProps,
  AppShellLayout,
  AppShellSidebarPosition,
  AppShellContextValue,
  AppHeaderProps,
  AppFooterProps,
  AppContentProps,
} from "./AppShell";
