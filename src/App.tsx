// src/App.tsx
import React, { useState } from "react";
import { CharactersPage } from "./pages/CharactersPage";
import { Users, Settings, Home, Map, Sword } from "lucide-react";
import "./App.css";

type PageType = "home" | "characters" | "npcs" | "environments" | "settings";

interface NavigationItem {
  id: PageType;
  label: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  {
    id: "characters",
    label: "Personaggi",
    icon: <Users className="w-5 h-5" />,
  },
  { id: "npcs", label: "NPC", icon: <Sword className="w-5 h-5" /> },
  {
    id: "environments",
    label: "Ambientazioni",
    icon: <Map className="w-5 h-5" />,
  },
  {
    id: "settings",
    label: "Impostazioni",
    icon: <Settings className="w-5 h-5" />,
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("characters");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <DashboardPage />;
      case "characters":
        return <CharactersPage />;
      case "npcs":
        return <NPCsPage />;
      case "environments":
        return <EnvironmentsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <CharactersPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <nav className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            D&D Assistant
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Dungeon Master Tools
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === item.id
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Tauri + React + TypeScript
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">{renderCurrentPage()}</div>
      </main>
    </div>
  );
}

// Placeholder components per le altre pagine
const DashboardPage: React.FC = () => (
  <div className="text-center py-12">
    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Dashboard
    </h2>
    <p className="text-gray-600 dark:text-gray-300">
      Panoramica della tua campagna (da implementare)
    </p>
  </div>
);

const NPCsPage: React.FC = () => (
  <div className="text-center py-12">
    <Sword className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      NPC
    </h2>
    <p className="text-gray-600 dark:text-gray-300">
      Gestione NPC (da migrare dal progetto esistente)
    </p>
  </div>
);

const EnvironmentsPage: React.FC = () => (
  <div className="text-center py-12">
    <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Ambientazioni
    </h2>
    <p className="text-gray-600 dark:text-gray-300">
      Gestione ambientazioni (da migrare dal progetto esistente)
    </p>
  </div>
);

const SettingsPage: React.FC = () => (
  <div className="text-center py-12">
    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      Impostazioni
    </h2>
    <p className="text-gray-600 dark:text-gray-300">
      Configurazione dell'applicazione (da implementare)
    </p>
  </div>
);

export default App;
