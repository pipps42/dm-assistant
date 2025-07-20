import React, { useState, useContext } from "react";
import { useCampaign } from "../../hooks/dnd/useCampaign";
import CampaignSelector from "../dnd/CampaignSelector";
import StatusBadge from "../dnd/StatusBadge";
import ActionButton from "../dnd/ActionButton";

export interface AppShellProps {
  children: React.ReactNode;
  currentTool?: string;
  onToolChange?: (tool: string) => void;
}

// Available tools configuration
const AVAILABLE_TOOLS = [
  {
    id: "home",
    name: "Dashboard",
    icon: "🏠",
    description: "Panoramica generale",
    requiresCampaign: false,
  },
  {
    id: "campaign-manager",
    name: "Campaign Manager",
    icon: "🏰",
    description: "Gestione campagne",
    requiresCampaign: false,
  },
  {
    id: "character-manager",
    name: "Character Manager",
    icon: "🎭",
    description: "Gestione personaggi",
    requiresCampaign: true,
  },
  {
    id: "npc-manager",
    name: "NPC Manager",
    icon: "👥",
    description: "Gestione NPCs",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "environment-manager",
    name: "Environment Manager",
    icon: "🌍",
    description: "Gestione ambientazioni",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "map-manager",
    name: "Map Manager",
    icon: "🗺️",
    description: "Gestione mappe",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "quest-tracker",
    name: "Quest Tracker",
    icon: "📜",
    description: "Gestione quest",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "item-catalog",
    name: "Item Catalog",
    icon: "⚔️",
    description: "Catalogo oggetti",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "inventory-tracker",
    name: "Inventory Tracker",
    icon: "🎒",
    description: "Inventario party",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "bestiary",
    name: "Bestiary",
    icon: "🐉",
    description: "Bestiario",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "encounter-builder",
    name: "Encounter Builder",
    icon: "⚔️",
    description: "Creazione incontri",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "combat-tracker",
    name: "Combat Tracker",
    icon: "🎲",
    description: "Gestione combattimenti",
    requiresCampaign: true,
    disabled: true,
  },
  {
    id: "dice-roller",
    name: "Dice Roller",
    icon: "🎲",
    description: "Tira dadi",
    requiresCampaign: false,
    disabled: true,
  },
] as const;

const AppShell: React.FC<AppShellProps> = ({
  children,
  currentTool = "home",
  onToolChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCampaignSelector, setShowCampaignSelector] = useState(false);

  const {
    currentCampaign,
    campaignSummaries,
    setCurrentCampaign,
    loading,
    error,
    overallStats,
    campaignsNeedingAttention,
  } = useCampaign();

  const currentToolConfig = AVAILABLE_TOOLS.find(
    (tool) => tool.id === currentTool
  );
  const requiresCampaign = currentToolConfig?.requiresCampaign;
  const hasNoCampaignWarning = requiresCampaign && !currentCampaign;

  const handleToolChange = (toolId: string) => {
    const tool = AVAILABLE_TOOLS.find((t) => t.id === toolId);

    // Check if tool requires campaign
    if (tool?.requiresCampaign && !currentCampaign) {
      alert(
        "Questo tool richiede una campagna attiva. Seleziona o crea una campagna prima di continuare."
      );
      return;
    }

    if (tool?.disabled) {
      alert(`${tool.name} sarà disponibile presto!`);
      return;
    }

    onToolChange?.(toolId);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="app-shell flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`
          sidebar flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300
          ${sidebarOpen ? "w-64" : "w-16"}
        `}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  DM Assistant
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  D&D Campaign Manager
                </p>
              </div>
            )}
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={toggleSidebar}
              className="flex-shrink-0"
            >
              {sidebarOpen ? "◄" : "►"}
            </ActionButton>
          </div>
        </div>

        {/* Current Campaign */}
        {sidebarOpen && (
          <div className="current-campaign p-4 border-b border-gray-200 dark:border-gray-700">
            {currentCampaign ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Campagna Corrente:
                  </span>
                  <ActionButton
                    variant="secondary"
                    size="xs"
                    onClick={() => setShowCampaignSelector(true)}
                  >
                    📋
                  </ActionButton>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <div className="font-medium text-blue-900 dark:text-blue-300 text-sm truncate">
                    {currentCampaign.name}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    Sessione {currentCampaign.currentSession} •{" "}
                    {currentCampaign.info.activeCharacters} PG
                  </div>
                  <StatusBadge
                    variant={
                      currentCampaign.info.status === "Active"
                        ? "success"
                        : "warning"
                    }
                    size="sm"
                    className="mt-2"
                  >
                    {currentCampaign.info.status === "Active"
                      ? "Attiva"
                      : currentCampaign.info.status === "Planning"
                      ? "Pianificazione"
                      : currentCampaign.info.status}
                  </StatusBadge>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nessuna Campagna
                </div>
                <ActionButton
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => setShowCampaignSelector(true)}
                >
                  📋 Seleziona Campagna
                </ActionButton>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="navigation flex-1 overflow-y-auto">
          <div className="py-4">
            {/* Main Tools */}
            <div className="px-4 mb-4">
              {sidebarOpen && (
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Principali
                </h2>
              )}
              <div className="space-y-1">
                {AVAILABLE_TOOLS.filter((tool) =>
                  ["home", "campaign-manager", "character-manager"].includes(
                    tool.id
                  )
                ).map((tool) => (
                  <NavItem
                    key={tool.id}
                    tool={tool}
                    isActive={currentTool === tool.id}
                    isCollapsed={!sidebarOpen}
                    requiresCampaign={tool.requiresCampaign}
                    hasCampaign={!!currentCampaign}
                    onClick={() => handleToolChange(tool.id)}
                  />
                ))}
              </div>
            </div>

            {/* Management Tools */}
            <div className="px-4 mb-4">
              {sidebarOpen && (
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Gestione
                </h2>
              )}
              <div className="space-y-1">
                {AVAILABLE_TOOLS.filter((tool) =>
                  [
                    "npc-manager",
                    "environment-manager",
                    "map-manager",
                    "quest-tracker",
                    "item-catalog",
                    "inventory-tracker",
                  ].includes(tool.id)
                ).map((tool) => (
                  <NavItem
                    key={tool.id}
                    tool={tool}
                    isActive={currentTool === tool.id}
                    isCollapsed={!sidebarOpen}
                    requiresCampaign={tool.requiresCampaign}
                    hasCampaign={!!currentCampaign}
                    onClick={() => handleToolChange(tool.id)}
                  />
                ))}
              </div>
            </div>

            {/* Combat Tools */}
            <div className="px-4 mb-4">
              {sidebarOpen && (
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Combattimento
                </h2>
              )}
              <div className="space-y-1">
                {AVAILABLE_TOOLS.filter((tool) =>
                  [
                    "bestiary",
                    "encounter-builder",
                    "combat-tracker",
                    "dice-roller",
                  ].includes(tool.id)
                ).map((tool) => (
                  <NavItem
                    key={tool.id}
                    tool={tool}
                    isActive={currentTool === tool.id}
                    isCollapsed={!sidebarOpen}
                    requiresCampaign={tool.requiresCampaign}
                    hasCampaign={!!currentCampaign}
                    onClick={() => handleToolChange(tool.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="sidebar-footer p-4 border-t border-gray-200 dark:border-gray-700">
            {/* Quick Stats */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              <div className="flex justify-between">
                <span>Campagne:</span>
                <span>{overallStats.totalCampaigns}</span>
              </div>
              <div className="flex justify-between">
                <span>Attive:</span>
                <span>{overallStats.activeCampaigns}</span>
              </div>
              {campaignsNeedingAttention.length > 0 && (
                <div className="flex justify-between text-yellow-600 dark:text-yellow-400">
                  <span>Attenzione:</span>
                  <span>{campaignsNeedingAttention.length}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentToolConfig?.icon}{" "}
                {currentToolConfig?.name || "DM Assistant"}
              </h1>
              {currentToolConfig?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentToolConfig.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Campaign Quick Selector */}
              {currentCampaign && (
                <div className="hidden md:flex items-center gap-2">
                  <StatusBadge variant="info" size="sm">
                    📖 {currentCampaign.name}
                  </StatusBadge>
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCampaignSelector(true)}
                  >
                    Cambia
                  </ActionButton>
                </div>
              )}

              {/* Alerts/Notifications */}
              {campaignsNeedingAttention.length > 0 && (
                <StatusBadge variant="warning" size="sm">
                  ⚠️ {campaignsNeedingAttention.length} richiedono attenzione
                </StatusBadge>
              )}

              {loading && (
                <StatusBadge variant="info" size="sm">
                  🔄 Caricamento...
                </StatusBadge>
              )}
            </div>
          </div>

          {/* Campaign Required Warning */}
          {hasNoCampaignWarning && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">
                    ⚠️
                  </span>
                  <span className="text-yellow-800 dark:text-yellow-300 text-sm">
                    Questo tool richiede una campagna attiva
                  </span>
                </div>
                <ActionButton
                  variant="warning"
                  size="sm"
                  onClick={() => setShowCampaignSelector(true)}
                >
                  Seleziona Campagna
                </ActionButton>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 dark:text-red-400">❌</span>
                  <span className="text-red-800 dark:text-red-300 text-sm">
                    {error}
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="content flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Campaign Selector Modal */}
      {showCampaignSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Seleziona Campagna
                </h2>
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCampaignSelector(false)}
                >
                  ✕
                </ActionButton>
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              <CampaignSelector
                campaigns={campaignSummaries}
                currentCampaign={currentCampaign}
                onSelect={(campaign) => {
                  setCurrentCampaign(campaign.id);
                  setShowCampaignSelector(false);
                }}
                onCreateNew={() => {
                  setShowCampaignSelector(false);
                  onToolChange?.("campaign-manager");
                }}
                showCreateButton={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Navigation Item Component
interface NavItemProps {
  tool: (typeof AVAILABLE_TOOLS)[number];
  isActive: boolean;
  isCollapsed: boolean;
  requiresCampaign: boolean;
  hasCampaign: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  tool,
  isActive,
  isCollapsed,
  requiresCampaign,
  hasCampaign,
  onClick,
}) => {
  const isDisabled = tool.disabled || (requiresCampaign && !hasCampaign);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
        ${
          isActive
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
            : isDisabled
            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }
        ${isCollapsed ? "justify-center" : ""}
      `}
      title={isCollapsed ? tool.name : undefined}
    >
      <span className="text-lg flex-shrink-0">{tool.icon}</span>
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{tool.name}</span>
            {tool.disabled && (
              <StatusBadge variant="neutral" size="sm">
                Soon
              </StatusBadge>
            )}
            {requiresCampaign && !hasCampaign && !tool.disabled && (
              <StatusBadge variant="warning" size="sm">
                ⚠️
              </StatusBadge>
            )}
          </div>
          {tool.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {tool.description}
            </p>
          )}
        </div>
      )}
    </button>
  );
};

export default AppShell;
