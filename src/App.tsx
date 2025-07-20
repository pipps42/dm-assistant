import { useState, useEffect } from "react";
import AppShell from "./shared/components/layout/AppShell";
import AppRouter from "./shared/components/layout/AppRouter";
import "@/assets/styles/globals.css";

function App() {
  const [currentTool, setCurrentTool] = useState<string>("home");
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize app on startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        console.log("DM Assistant initializing...");

        // Simulate initialization delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsInitializing(false);
        console.log("DM Assistant initialized successfully");
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  const handleToolChange = (toolId: string) => {
    setCurrentTool(toolId);
  };

  // Loading screen during initialization
  if (isInitializing) {
    return (
      <div className="loading-screen min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-pulse">🏰</div>
          <h1 className="text-3xl font-bold text-white mb-4">DM Assistant</h1>
          <p className="text-gray-400 mb-8">
            Inizializzazione dell'applicazione...
          </p>

          {/* Loading Animation */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Caricamento sistema campagne...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen">
      <AppShell currentTool={currentTool} onToolChange={handleToolChange}>
        <AppRouter currentTool={currentTool} />
      </AppShell>
    </div>
  );
}

export default App;
