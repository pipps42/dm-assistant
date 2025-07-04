/**
 * App.js - Versione completa con architettura semplificata
 * Tutti i manager seguono lo stesso pattern pulito
 */
import dataStore from "./data/data-store.js";
import modalManager from "./ui/modal-manager.js";
import characterManager from "./components/character-manager.js";
import npcManager from "./components/npc-manager.js";
import environmentManager from "./components/environment-manager.js";

class DMAssistantApp {
  constructor() {
    this.currentSection = "characters";
    this.managers = {
      characters: characterManager,
      npcs: npcManager,
      environments: environmentManager,
    };

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
      console.log("Initializing DM Assistant...");

      // Wait for electron API
      if (!window.electronAPI) {
        throw new Error("Electron API not available");
      }

      // Initialize core systems
      await dataStore.init();
      modalManager.init();

      // Setup UI
      this.setupNavigation();
      this.setupEventListeners();
      this.setupContextMenu();

      // Load initial section
      await this.switchSection("characters");

      // Show app
      this.hideSplashScreen();

      console.log("DM Assistant ready!");
      this.showNotification("Applicazione caricata con successo!", "success");
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError("Errore durante l'inizializzazione: " + error.message);
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

  setupEventListeners() {
    // Navigation
    document.getElementById("nav-menu").addEventListener("click", (e) => {
      const navItem = e.target.closest(".nav-item");
      if (navItem) {
        this.switchSection(navItem.dataset.section);
      }
    });

    // Add button
    document.getElementById("add-button").addEventListener("click", () => {
      const manager = this.managers[this.currentSection];
      manager?.openForm();
    });

    // Sidebar toggle
    document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
      this.toggleSidebar();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        const manager = this.managers[this.currentSection];
        manager?.openForm();
      }

      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
  }

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

    // Render section
    await this.renderSection(sectionId);
  }

  async renderSection(sectionId) {
    try {
      const manager = this.managers[sectionId];
      if (manager) {
        await manager.render();
      } else {
        document.getElementById("content-body").innerHTML = `
          <div class="empty-state">
            <h3>Sezione "${sectionId}" non implementata</h3>
            <p>Questa funzionalità sarà disponibile presto</p>
          </div>
        `;
      }
    } catch (error) {
      console.error(`Error rendering ${sectionId}:`, error);
      this.showError(`Errore nel caricamento: ${error.message}`);
    }
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

  // ========== UTILITY METHODS ==========

  getDataStats() {
    const stats = dataStore.getStats();

    // Add manager-specific stats
    Object.keys(this.managers).forEach((key) => {
      const manager = this.managers[key];
      if (manager.getStats) {
        stats[key + "Stats"] = manager.getStats();
      }
    });

    return stats;
  }

  async exportAllData() {
    try {
      const allData = {
        characters: characterManager.getAll(),
        npcs: npcManager.getAll(),
        environments: environmentManager.getAll(),
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(allData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dnd-complete-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();

      URL.revokeObjectURL(url);
      this.showNotification("Tutti i dati esportati!", "success");
    } catch (error) {
      this.showError("Errore durante l'esportazione: " + error.message);
    }
  }

  async importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Import to dataStore
      await dataStore.import(data);

      // Refresh current section
      await this.renderSection(this.currentSection);

      this.showNotification("Dati importati con successo!", "success");
    } catch (error) {
      this.showError("Errore durante l'importazione: " + error.message);
    }
  }

  // ========== SEARCH FUNCTIONALITY ==========

  setupSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });
  }

  async performSearch(query) {
    if (!query.trim()) {
      await this.renderSection(this.currentSection);
      return;
    }

    const manager = this.managers[this.currentSection];
    if (!manager) return;

    const searchMethod = manager.search || manager.searchEntities;
    if (searchMethod) {
      const results = searchMethod.call(manager, query);
      this.renderSearchResults(results);
    }
  }

  renderSearchResults(results) {
    const contentBody = document.getElementById("content-body");

    if (results.length === 0) {
      contentBody.innerHTML = `
        <div class="empty-state">
          <h3>Nessun risultato trovato</h3>
          <p>Prova con termini di ricerca diversi</p>
        </div>
      `;
      return;
    }

    const manager = this.managers[this.currentSection];
    const cards = results.map((entity) => manager.renderCard(entity)).join("");
    contentBody.innerHTML = `
      <div class="search-results">
        <p class="search-info">Trovati ${results.length} risultati</p>
        <div class="cards-grid">${cards}</div>
      </div>
    `;

    manager.attachEvents();
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  window.app = new DMAssistantApp();

  // Expose managers globally for onclick handlers and console access
  window.characterManager = characterManager;
  window.npcManager = npcManager;
  window.environmentManager = environmentManager;
  window.dataStore = dataStore;

  await window.app.init();
});

export default DMAssistantApp;
