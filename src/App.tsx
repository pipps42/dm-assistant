import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DemoHomePage from "@/pages/DemoHomePage";
import DemoTokensPage from "@/pages/DemoTokensPage";
import DemoComponentsPage from "@/pages/DemoComponentsPage";
import DemoFormsPage from "@/pages/DemoFormsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DemoHomePage />} />
        <Route path="/demo/tokens" element={<DemoTokensPage />} />
        <Route path="/demo/components" element={<DemoComponentsPage />} />
        <Route path="/demo/forms" element={<DemoFormsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

/* import { useState } from "react";
import "@/assets/styles/globals.css";
import { CharacterManagerTool } from "./tools";

function App() {
  const [currentView, setCurrentView] = useState<"home" | "character">("home");

  const renderCurrentView = () => {
    switch (currentView) {
      case "character":
        return <CharacterManagerTool />;
      case "home":
      default:
        return (
          <div className="container">
            <h1>DM Assistant</h1>
            <div className="row">
              <p>
                Benvenuto in DM Assistant - Il tuo compagno per gestire campagne
                D&D 5e
              </p>
            </div>

            <div className="row" style={{ marginTop: "2rem" }}>
              <h2>Tools Disponibili</h2>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: "1rem",
                }}
              >
                <button
                  onClick={() => setCurrentView("character")}
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  🎭 Character Manager
                </button>

                <button
                  disabled
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: "#ccc",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  🏰 Campaign Manager (Coming Soon)
                </button>

                <button
                  disabled
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: "#ccc",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  👥 NPC Manager (Coming Soon)
                </button>

                <button
                  disabled
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: "#ccc",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  ⚔️ Combat Tracker (Coming Soon)
                </button>

                <button
                  disabled
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: "#ccc",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  🐉 Bestiary (Coming Soon)
                </button>

                <button
                  disabled
                  style={{
                    padding: "1rem 2rem",
                    backgroundColor: "#ccc",
                    color: "#666",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  🎲 Dice Roller (Coming Soon)
                </button>
              </div>
            </div>

            <div className="row" style={{ marginTop: "2rem" }}>
              <h3>🆕 Novità: Shared Components UI</h3>
              <div
                style={{
                  textAlign: "left",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <p>
                  <strong>✨ Implementato:</strong>
                </p>
                <ul style={{ marginLeft: "2rem" }}>
                  <li>
                    <strong>CharacterCard</strong> - Cards professionali per
                    visualizzare PG
                  </li>
                  <li>
                    <strong>StatusBadge</strong> - Badge per livello, stato,
                    relazioni, achievements
                  </li>
                  <li>
                    <strong>HealthTracker</strong> - Barra HP visuale con
                    animazioni
                  </li>
                  <li>
                    <strong>UI/UX migliorata</strong> - Design moderno e
                    responsive
                  </li>
                </ul>

                <p style={{ marginTop: "1rem" }}>
                  <strong>🎯 Confronta le Versioni:</strong>
                </p>
                <ul style={{ marginLeft: "2rem" }}>
                  <li>
                    <strong>Character Manager (NEW!)</strong> - Con shared
                    components
                  </li>
                  <li>
                    <strong>Character Test (Basic)</strong> - Versione originale
                    senza styling
                  </li>
                </ul>

                <p style={{ marginTop: "1rem" }}>
                  <strong>🚧 Prossimi Passi:</strong>
                </p>
                <ul style={{ marginLeft: "2rem" }}>
                  <li>NPCCard, QuestTracker, DiceRoller components</li>
                  <li>Campaign Management system</li>
                  <li>CharacterManager tool definitivo</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case "character":
        return "Character Manager";
      default:
        return "DM Assistant";
    }
  };

  return (
    <div className="App">
      {currentView !== "home" && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setCurrentView("home")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#646cff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ← Torna alla Home
          </button>
          <h2 style={{ margin: 0 }}>{getPageTitle()}</h2>
          <div></div>
        </div>
      )}

      {renderCurrentView()}
    </div>
  );
}

export default App;
 */
