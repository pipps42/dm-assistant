// src/shared/components/layout/AppRouter.tsx

import React from "react";

// Import all available tools
import CampaignManagerTool from "../../../tools/CampaignManager/CampaignManagerTool";
import ImprovedCharacterTestTool from "../../../tools/CharacterManager/ImprovedCharacterTestTool";
import NPCManagerTool from "../../../tools/NPCManager/NPCManagerTool";
import EnvironmentManagerTool from "../../../tools/EnvironmentManager/EnvironmentManagerTool";
import MapManagerTool from "../../../tools/MapManager/MapManagerTool";
import QuestTrackerTool from "../../../tools/QuestTracker/QuestTrackerTool";
import ItemCatalogTool from "../../../tools/ItemCatalog/ItemCatalogTool";
import InventoryTrackerTool from "../../../tools/InventoryTracker/InventoryTrackerTool";
import BestiaryTool from "../../../tools/Bestiary/BestiaryTool";
import EncounterBuilderTool from "../../../tools/EncounterBuilder/EncounterBuilderTool";
import CombatTrackerTool from "../../../tools/CombatTracker/CombatTrackerTool";
import DiceRollerTool from "../../../tools/DiceRoller/DiceRollerTool";

export interface AppRouterProps {
  currentTool: string;
}

// Dashboard/Home component
const DashboardTool: React.FC = () => {
  return (
    <div className="dashboard-tool p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏠 Dashboard DM Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Benvenuto nel tuo centro di controllo per campagne D&D 5e
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600 dark:text-blue-400 mr-4">
              🏰
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                -
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Campagne Attive
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-green-600 dark:text-green-400 mr-4">
              🎭
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                -
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Personaggi
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-purple-600 dark:text-purple-400 mr-4">
              📜
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                -
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Quest Attive
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl text-orange-600 dark:text-orange-400 mr-4">
              🎲
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                -
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sessioni Totali
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📅 Attività Recente
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">
                Nessuna attività recente
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Azioni Rapide
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              <div className="font-medium text-blue-900 dark:text-blue-300">
                🏰 Crea Nuova Campagna
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                Inizia una nuova avventura
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
              <div className="font-medium text-green-900 dark:text-green-300">
                🎭 Aggiungi Personaggio
              </div>
              <div className="text-sm text-green-700 dark:text-green-400">
                Crea un nuovo PG
              </div>
            </button>

            <button className="w-full text-left p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
              <div className="font-medium text-purple-900 dark:text-purple-300">
                ⚔️ Avvia Combattimento
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-400">
                Inizia un nuovo incontro
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tool Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔧 Strumenti Disponibili
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <div className="text-2xl mb-2">🏰</div>
            <div className="font-medium text-gray-900 dark:text-white">
              Campaign Manager
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Gestisci le tue campagne
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <div className="text-2xl mb-2">🎭</div>
            <div className="font-medium text-gray-900 dark:text-white">
              Character Manager
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Gestisci i personaggi
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 opacity-60">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-gray-900 dark:text-white">
              NPC Manager
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Presto disponibile
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 opacity-60">
            <div className="text-2xl mb-2">🐉</div>
            <div className="font-medium text-gray-900 dark:text-white">
              Bestiary
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Presto disponibile
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 opacity-60">
            <div className="text-2xl mb-2">⚔️</div>
            <div className="font-medium text-gray-900 dark:text-white">
              Combat Tracker
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Presto disponibile
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 opacity-60">
            <div className="text-2xl mb-2">🎲</div>
            <div className="font-medium text-gray-900 dark:text-white">
              Dice Roller
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Presto disponibile
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Coming Soon component for disabled tools
const ComingSoonTool: React.FC<{
  toolName: string;
  icon: string;
  description: string;
}> = ({ toolName, icon, description }) => {
  return (
    <div className="coming-soon-tool p-6 max-w-2xl mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-12">
        <div className="text-8xl mb-6">{icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {toolName}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {description}
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <div className="text-blue-900 dark:text-blue-300 font-medium mb-2">
            🚧 In Sviluppo
          </div>
          <div className="text-blue-700 dark:text-blue-400 text-sm">
            Questo strumento sarà disponibile presto! Nel frattempo, puoi
            utilizzare gli altri tools disponibili.
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRouter: React.FC<AppRouterProps> = ({ currentTool }) => {
  // Route to appropriate tool component
  switch (currentTool) {
    case "home":
      return <DashboardTool />;

    case "campaign-manager":
      return <CampaignManagerTool />;

    case "character-manager":
      return <ImprovedCharacterTestTool />;

    case "npc-manager":
      return (
        <ComingSoonTool
          toolName="NPC Manager"
          icon="👥"
          description="Gestisci NPCs, relazioni e interazioni"
        />
      );

    case "environment-manager":
      return (
        <ComingSoonTool
          toolName="Environment Manager"
          icon="🌍"
          description="Crea e gestisci ambientazioni e location"
        />
      );

    case "map-manager":
      return (
        <ComingSoonTool
          toolName="Map Manager"
          icon="🗺️"
          description="Gestisci mappe e annotazioni"
        />
      );

    case "quest-tracker":
      return (
        <ComingSoonTool
          toolName="Quest Tracker"
          icon="📜"
          description="Traccia quest e obiettivi"
        />
      );

    case "item-catalog":
      return (
        <ComingSoonTool
          toolName="Item Catalog"
          icon="⚔️"
          description="Catalogo oggetti e equipaggiamento"
        />
      );

    case "inventory-tracker":
      return (
        <ComingSoonTool
          toolName="Inventory Tracker"
          icon="🎒"
          description="Gestisci inventario del party"
        />
      );

    case "bestiary":
      return (
        <ComingSoonTool
          toolName="Bestiary"
          icon="🐉"
          description="Bestiario e stat block mostri"
        />
      );

    case "encounter-builder":
      return (
        <ComingSoonTool
          toolName="Encounter Builder"
          icon="⚔️"
          description="Crea incontri bilanciati"
        />
      );

    case "combat-tracker":
      return (
        <ComingSoonTool
          toolName="Combat Tracker"
          icon="🎲"
          description="Gestisci combattimenti e iniziativa"
        />
      );

    case "dice-roller":
      return (
        <ComingSoonTool
          toolName="Dice Roller"
          icon="🎲"
          description="Lancia dadi con notazione avanzata"
        />
      );

    default:
      return <DashboardTool />;
  }
};

export default AppRouter;
