import dataStore from "./data/data-store.js";
import modalManager from "./ui/modal-manager.js";
import {
  bootstrapManagerSystem,
  ManagerRegistry,
  SystemUtilities,
} from "./manager-setup-bootstrap.js";

class DMAssistantApp {
  constructor() {
    this.currentSection = "characters";
    this.managers = {}; // Sarà popolato dal sistema modulare
    this.isInitialized = false;

    this.navigationItems = [
      {
        id: "characters",
        icon: "👥",
        label: "Personaggi",
        title: "Personaggi Giocatori",
        buttonText: "+ Nuovo Personaggio",
      },
      {
        id: "environments",
        icon: "🗺️",
        label: "Ambientazioni",
        title: "Ambientazioni & Mappe",
        buttonText: "+ Nuova Ambientazione",
      },
      {
        id: "npcs",
        icon: "🧙",
        label: "NPC",
        title: "Non-Player Characters",
        buttonText: "+ Nuovo NPC",
      },
    ];
  }

  async init() {
    try {
      console.log("🚀 Initializing DM Assistant with modular system...");

      // Wait for electron API
      if (!window.electronAPI) {
        throw new Error("Electron API not available");
      }

      // Initialize core systems
      await dataStore.init();
      modalManager.init();

      // 🆕 Bootstrap modular manager system
      this.managers = bootstrapManagerSystem();
      // 🆕 Initialize manager registry
      ManagerRegistry.init(this.managers);

      // Setup UI
      this.setupNavigation();
      this.setupEventListeners();
      this.setupContextMenu();
      this.setupSystemCommands(); // 🆕 New system commands

      // Load initial section
      await this.switchSection("characters");

      // Show app
      this.hideSplashScreen();

      // 🆕 Perform system health check
      const health = SystemUtilities.performHealthCheck();
      if (health.status !== "healthy") {
        console.warn("⚠️ System health issues detected:", health.issues);
      }

      this.isInitialized = true;
      console.log("✅ DM Assistant ready with modular system!");
      this.showNotification("Applicazione caricata con successo!", "success");
    } catch (error) {
      console.error("❌ Initialization error:", error);
      this.showError("Errore durante l'inizializzazione: " + error.message);
    }
  }

  /**
   * 🆕 Setup system commands for advanced functionality
   */
  setupSystemCommands() {
    // Global keyboard shortcuts for system functions
    document.addEventListener("keydown", async (e) => {
      // Ctrl+Shift+E = Export all data
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        await SystemUtilities.exportAllData();
      }

      // Ctrl+Shift+S = System stats
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        this.showSystemStats();
      }

      // Ctrl+Shift+H = Health check
      if (e.ctrlKey && e.shiftKey && e.key === "H") {
        e.preventDefault();
        this.performHealthCheck();
      }

      // Ctrl+Shift+G = Global search
      if (e.ctrlKey && e.shiftKey && e.key === "G") {
        e.preventDefault();
        this.openGlobalSearch();
      }
    });

    // Add system menu if needed
    this.addSystemMenu();
  }

  /**
   * 🆕 Add system menu to header
   */
  addSystemMenu() {
    const header = document.querySelector(".app-header");
    if (!header) return;

    const systemMenu = document.createElement("div");
    systemMenu.className = "system-menu";
    systemMenu.innerHTML = `
      <button class="btn btn-ghost system-menu-toggle" title="Menu Sistema">
        ⚙️
      </button>
      <div class="system-menu-dropdown" style="display: none;">
        <button class="system-menu-item" data-action="global-search">
          🔍 Ricerca Globale
        </button>
        <button class="system-menu-item" data-action="system-stats">
          📊 Statistiche Sistema
        </button>
        <button class="system-menu-item" data-action="health-check">
          🏥 Controllo Sistema
        </button>
        <button class="system-menu-item" data-action="export-all">
          📦 Esporta Tutto
        </button>
        <hr>
        <button class="system-menu-item" data-action="generate-test-data">
          🧪 Genera Dati Test
        </button>
      </div>
    `;

    header.appendChild(systemMenu);

    // Setup menu toggle
    const toggle = systemMenu.querySelector(".system-menu-toggle");
    const dropdown = systemMenu.querySelector(".system-menu-dropdown");

    toggle.addEventListener("click", () => {
      const isVisible = dropdown.style.display !== "none";
      dropdown.style.display = isVisible ? "none" : "block";
    });

    // Setup menu actions
    dropdown.addEventListener("click", async (e) => {
      const action = e.target.dataset.action;
      if (!action) return;

      dropdown.style.display = "none";

      switch (action) {
        case "global-search":
          this.openGlobalSearch();
          break;
        case "system-stats":
          this.showSystemStats();
          break;
        case "health-check":
          this.performHealthCheck();
          break;
        case "export-all":
          await SystemUtilities.exportAllData();
          break;
        case "generate-test-data":
          await this.generateTestData();
          break;
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!systemMenu.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  /**
   * 🆕 Open global search modal
   */
  async openGlobalSearch() {
    const query = await modalManager.input({
      title: "Ricerca Globale",
      label: "Cerca in tutti i dati:",
      placeholder: "Nome, descrizione, classe, razza...",
      inputType: "text",
    });

    if (!query?.trim()) return;

    try {
      const results = await SystemUtilities.globalSearch(query.trim());
      this.showSearchResults(results, query);
    } catch (error) {
      this.showError("Errore durante la ricerca: " + error.message);
    }
  }

  /**
   * 🆕 Show search results in modal
   */
  showSearchResults(results, query) {
    const totalResults = Object.values(results).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    if (totalResults === 0) {
      modalManager.open({
        title: `Risultati per "${query}"`,
        content: `
          <div class="search-results">
            <div class="empty-state">
              <h3>Nessun risultato trovato</h3>
              <p>Prova con termini di ricerca diversi</p>
            </div>
          </div>
        `,
        size: "medium",
      });
      return;
    }

    const resultsList = Object.entries(results)
      .map(
        ([entityType, entities]) => `
        <div class="search-category">
          <h4>${this.getEntityDisplayName(entityType)} (${entities.length})</h4>
          <div class="search-items">
            ${entities
              .slice(0, 5)
              .map(
                (entity) => `
              <div class="search-item" onclick="this.openEntity('${entityType}', '${
                  entity.id
                }')">
                <div class="search-item-name">${entity.name}</div>
                <div class="search-item-details">
                  ${this.getEntityDetails(entityType, entity)}
                </div>
              </div>
            `
              )
              .join("")}
            ${
              entities.length > 5
                ? `
              <div class="search-more">
                ... e altri ${entities.length - 5} risultati
              </div>
            `
                : ""
            }
          </div>
        </div>
      `
      )
      .join("");

    modalManager.open({
      title: `Risultati per "${query}" (${totalResults})`,
      content: `
        <div class="search-results">
          ${resultsList}
        </div>
      `,
      size: "large",
    });
  }

  /**
   * 🆕 Show system statistics
   */
  showSystemStats() {
    const stats = ManagerRegistry.getSystemStats();

    const statsHTML = `
      <div class="system-stats">
        <div class="stats-overview">
          <h4>Panoramica Sistema</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-number">${stats.totalEntities}</span>
              <span class="stat-label">Entità Totali</span>
            </div>
            <div class="stat-card ${
              stats.systemHealth === "healthy" ? "stat-success" : "stat-warning"
            }">
              <span class="stat-icon">${
                stats.systemHealth === "healthy" ? "✅" : "⚠️"
              }</span>
              <span class="stat-label">Sistema ${
                stats.systemHealth === "healthy" ? "Sano" : "Degradato"
              }</span>
            </div>
          </div>
        </div>
        
        <div class="stats-details">
          <h4>Dettagli per Categoria</h4>
          ${Object.entries(stats.managerStats)
            .map(
              ([type, stat]) => `
            <div class="stat-category">
              <h5>${this.getEntityDisplayName(type)}</h5>
              <div class="stat-row">
                <span>Totale: ${stat.total || 0}</span>
                <span>Recenti: ${stat.recent || 0}</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    modalManager.open({
      title: "Statistiche Sistema",
      content: statsHTML,
      size: "medium",
    });
  }

  /**
   * 🆕 Perform and show health check
   */
  performHealthCheck() {
    const health = SystemUtilities.performHealthCheck();

    const healthHTML = `
      <div class="health-check">
        <div class="health-status ${health.status}">
          <h4>Stato Sistema: ${health.status.toUpperCase()}</h4>
          <small>Controllo eseguito il ${new Date(
            health.timestamp
          ).toLocaleString("it-IT")}</small>
        </div>
        
        ${
          health.issues.length > 0
            ? `
          <div class="health-issues">
            <h5>⚠️ Problemi Rilevati:</h5>
            <ul>
              ${health.issues.map((issue) => `<li>${issue}</li>`).join("")}
            </ul>
          </div>
        `
            : `
          <div class="health-success">
            <p>✅ Tutti i controlli sono passati con successo!</p>
          </div>
        `
        }
        
        <div class="health-details">
          <h5>Dettagli Controlli:</h5>
          ${Object.entries(health.checks)
            .map(
              ([component, check]) => `
            <div class="health-component">
              <strong>${component}:</strong>
              ${check.initialized ? "✅" : "❌"} Inizializzato
              ${
                check.hasData !== undefined
                  ? (check.hasData ? "✅" : "❌") + " Dati Presenti"
                  : ""
              }
              ${
                check.errors && check.errors.length > 0
                  ? `<br><small style="color: red;">Errori: ${check.errors.join(
                      ", "
                    )}</small>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    modalManager.open({
      title: "Controllo Integrità Sistema",
      content: healthHTML,
      size: "large",
    });
  }

  /**
   * 🆕 Generate test data
   */
  async generateTestData() {
    const confirmed = await modalManager.confirm({
      title: "Genera Dati di Test",
      message:
        "Generare dati di test per lo sviluppo? Verranno creati personaggi, NPC e ambientazioni di esempio.",
      confirmText: "Genera",
    });

    if (confirmed) {
      const { DevUtilities } = await import("./manager-setup-bootstrap.js");
      await DevUtilities.generateTestData();
      await this.renderSection(this.currentSection);
    }
  }

  setupEventListeners() {
    // Navigation - usa il nuovo sistema
    document.getElementById("nav-menu").addEventListener("click", (e) => {
      const navItem = e.target.closest(".nav-item");
      if (navItem) {
        this.switchSection(navItem.dataset.section);
      }
    });

    // Add button - usa il manager registry
    document.getElementById("add-button").addEventListener("click", () => {
      const manager = ManagerRegistry.getManager(this.currentSection);
      manager?.openForm();
    });

    // Sidebar toggle
    document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
      this.toggleSidebar();
    });

    // Enhanced keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        const manager = ManagerRegistry.getManager(this.currentSection);
        manager?.openForm();
      }

      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        this.toggleSidebar();
      }

      // 🆕 Enhanced search
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        this.focusSearch();
      }
    });
  }

  async switchSection(sectionId) {
    const section = this.navigationItems.find((item) => item.id === sectionId);
    if (!section) return;

    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.section === sectionId);
    });

    // Update header
    document.getElementById("section-title").textContent = section.title;

    // Update add button
    const addButton = document.getElementById("add-button");
    if (addButton) {
      addButton.textContent = section.buttonText;
      addButton.style.display = "block";
    }

    this.currentSection = sectionId;

    // Render section using manager registry
    await this.renderSection(sectionId);
  }

  async renderSection(sectionId) {
    try {
      // 🆕 Use manager registry instead of hardcoded managers
      const manager = ManagerRegistry.getManager(sectionId);
      if (manager) {
        await manager.render();
      } else {
        document.getElementById("content-body").innerHTML = `
          <div class="empty-state">
            <h3>Manager per "${sectionId}" non disponibile</h3>
            <p>Verifica la configurazione del sistema</p>
          </div>
        `;
      }
    } catch (error) {
      console.error(`Error rendering ${sectionId}:`, error);
      this.showError(`Errore nel caricamento: ${error.message}`);
    }
  }

  // 🆕 NUOVI METODI DI UTILITÀ

  getEntityDisplayName(entityType) {
    const names = {
      character: "Personaggi",
      characters: "Personaggi",
      npc: "NPCs",
      npcs: "NPCs",
      environment: "Ambientazioni",
      environments: "Ambientazioni",
    };
    return names[entityType] || entityType;
  }

  getEntityDetails(entityType, entity) {
    switch (entityType) {
      case "characters":
        return `${entity.class} ${entity.race} - Livello ${entity.level}`;
      case "npcs":
        return `${entity.profession || "NPC"} - ${entity.attitude}`;
      case "environments":
        return `${entity.type || "Ambientazione"} - ${entity.climate || ""}`;
      default:
        return entity.description || "";
    }
  }

  openEntity(entityType, entityId) {
    const manager = ManagerRegistry.getManager(entityType);
    if (manager) {
      manager.openDetail(entityId);
    }
  }

  focusSearch() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.focus();
    } else {
      this.openGlobalSearch();
    }
  }

  // METODI ESISTENTI CONSERVATI

  setupContextMenu() {
    document.addEventListener("contextmenu", (e) => {
      const card = e.target.closest(".card, .environment-card");
      if (!card) return;

      e.preventDefault();
      this.showContextMenu(e, card);
    });

    document.addEventListener("click", () => {
      this.hideContextMenu();
    });
  }

  showContextMenu(event, card) {
    this.hideContextMenu();

    const contextMenu = document.createElement("div");
    contextMenu.className = "context-menu";
    contextMenu.id = "context-menu";

    let actions = [];
    let manager = null;
    let entityId = null;

    // Determine entity type and manager
    if (card.dataset.characterId) {
      manager = this.managers.characters;
      entityId = card.dataset.characterId;
    } else if (card.dataset.npcId) {
      manager = this.managers.npcs;
      entityId = card.dataset.npcId;
    } else if (card.dataset.environmentId) {
      manager = this.managers.environments;
      entityId = card.dataset.environmentId;
    }

    if (manager && entityId) {
      actions = [
        {
          label: "Visualizza",
          action: () => manager.openDetail(entityId),
        },
        {
          label: "Modifica",
          action: () => {
            const entity = manager.getById(entityId);
            manager.openForm(entity);
          },
        },
        {
          label: "Elimina",
          action: () => manager.delete(entityId),
        },
      ];
    }

    contextMenu.innerHTML = actions
      .map(
        (action) => `
        <div class="context-menu-item" data-action="${action.label.toLowerCase()}">
          ${action.label}
        </div>
      `
      )
      .join("");

    // Position menu
    contextMenu.style.left = event.pageX + "px";
    contextMenu.style.top = event.pageY + "px";

    document.body.appendChild(contextMenu);

    // Adjust position if outside viewport
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      contextMenu.style.left = event.pageX - rect.width + "px";
    }
    if (rect.bottom > window.innerHeight) {
      contextMenu.style.top = event.pageY - rect.height + "px";
    }

    // Add click handlers
    contextMenu.addEventListener("click", (e) => {
      const actionElement = e.target.closest(".context-menu-item");
      if (!actionElement) return;

      const actionIndex = Array.from(contextMenu.children).indexOf(
        actionElement
      );
      actions[actionIndex]?.action();
      this.hideContextMenu();
    });
  }

  hideContextMenu() {
    const contextMenu = document.getElementById("context-menu");
    if (contextMenu) {
      contextMenu.remove();
    }
  }

  setupNavigation() {
    const navMenu = document.getElementById("nav-menu");
    navMenu.innerHTML = this.navigationItems
      .map(
        (item) => `
        <div class="nav-item ${
          item.id === this.currentSection ? "active" : ""
        }" 
             data-section="${item.id}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </div>
      `
      )
      .join("");
  }

  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".main-content");

    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("sidebar-collapsed");

    // Save state
    const isCollapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem("sidebar-collapsed", isCollapsed);
  }

  hideSplashScreen() {
    const splash = document.getElementById("splash-screen");
    const app = document.getElementById("app");

    if (!splash || !app) return;

    setTimeout(() => {
      splash.style.opacity = "0";
      setTimeout(() => {
        splash.style.display = "none";
        app.style.display = "flex";
        app.style.opacity = "1";
      }, 200);
    }, 500);
  }

  // ========== NOTIFICATION SYSTEM ==========

  showNotification(message, type = "info", duration = 4000) {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notifications.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  showError(message) {
    this.showNotification(message, "error", 6000);
  }

  // 🆕 METODI MIGLIORATI

  async exportAllData() {
    return await SystemUtilities.exportAllData();
  }

  async importData(file) {
    try {
      const text = await file.text();
      await SystemUtilities.importAllData(text);
      await this.renderSection(this.currentSection);
    } catch (error) {
      this.showError("Errore durante l'importazione: " + error.message);
    }
  }

  getDataStats() {
    return ManagerRegistry.getSystemStats();
  }

  // Cleanup on app destruction
  destroy() {
    if (this.isInitialized) {
      ManagerRegistry.cleanup();
      this.isInitialized = false;
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  window.app = new DMAssistantApp();
  await window.app.init();
});

export default DMAssistantApp;
