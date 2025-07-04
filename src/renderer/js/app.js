// Import core modules
import dataStore from "./data/data-store.js";
import EventBus from "./core/event-bus.js";
import modalManager from "./ui/modal-manager.js";

// Import component managers
import characterManager from "./components/character-manager.js";
import npcManager from "./components/npc-manager.js";
import environmentManager from "./components/environment-manager.js";

// Main application entry point
class DMAssistantApp {
  constructor() {
    this.currentSection = "characters";
    this.isInitialized = false;

    // Component managers
    this.managers = {
      characters: characterManager,
      npcs: npcManager,
      environments: environmentManager,
    };

    // Initialize modal manager
    modalManager.init();

    // Navigation items configuration con icone
    this.navigationItems = [
      {
        id: "characters",
        icon: "👥",
        iconName: "users",
        label: "Personaggi",
        title: "Personaggi Giocatori",
        button: "+ Aggiungi Personaggio",
      },
      {
        id: "environments",
        icon: "🗺️",
        iconName: "map",
        label: "Ambientazioni",
        title: "Ambientazioni & Mappe",
        button: "+ Nuova Ambientazione",
      },
      {
        id: "npcs",
        icon: "🧙",
        iconName: "wizard",
        label: "NPC",
        title: "NPC",
        button: "+ Nuovo NPC",
      },
      {
        id: "bestiary",
        icon: "👹",
        iconName: "monster",
        label: "Bestiario",
        title: "Bestiario",
        button: "+ Nuovo Mostro",
      },
      {
        id: "encounters",
        icon: "⚔️",
        iconName: "swords",
        label: "Incontri",
        title: "Gestione Incontri",
        button: null,
      },
    ];

    // Aggiungi dopo la costruzione
    this.sidebarCollapsed = false;
  }

  async init() {
    try {
      console.log("Initializing DM Assistant...");

      // Wait for electron API to be available
      if (!window.electronAPI) {
        throw new Error("Electron API not available");
      }

      // Initialize data store
      await dataStore.init();
      console.log("DataStore initialized");

      // Show app version
      await this.displayAppVersion();

      // Setup navigation
      this.setupNavigation();

      // Setup event listeners
      this.setupEventListeners();

      this.setupContextMenu();

      // Load initial section
      await this.switchSection("characters");

      // Hide splash screen and show app
      this.hideSplashScreen();

      this.isInitialized = true;
      console.log("DM Assistant initialized successfully");

      // Load sidebar state
      const savedSidebarState = localStorage.getItem("sidebar-collapsed");
      if (savedSidebarState === "true") {
        this.toggleSidebar();
      }

      // Render la sezione corrente ora che siamo inizializzati
      await this.renderSection(this.currentSection);

      // Show welcome notification
      this.showNotification("DM Assistant caricato con successo!", "success");
    } catch (error) {
      console.error("Error initializing app:", error);
      this.showError(
        "Errore durante l'inizializzazione dell'app: " + error.message
      );
    }
  }

  async displayAppVersion() {
    try {
      const version = await window.electronAPI.app.getVersion();
      const versionElement = document.getElementById("app-version");
      if (versionElement) {
        versionElement.textContent = `v${version}`;
      }
    } catch (error) {
      console.warn("Could not get app version:", error);
    }
  }

  hideSplashScreen() {
    const splash = document.getElementById("splash-screen");
    const app = document.getElementById("app");

    setTimeout(() => {
      splash.style.opacity = "0";
      setTimeout(() => {
        splash.style.display = "none";
        app.style.display = "flex";
        app.style.opacity = "0";

        setTimeout(() => {
          app.style.transition = "opacity 0.3s ease-in";
          app.style.opacity = "1";
        }, 50);
      }, 200);
    }, 500); // Minimum splash time
  }

  setupNavigation() {
    const navMenu = document.getElementById("nav-menu");
    if (!navMenu) return;

    navMenu.innerHTML = this.navigationItems
      .map(
        (item) => `
        <div class="nav-item ${
          item.id === this.currentSection ? "active" : ""
        }" 
             data-section="${item.id}" 
             data-label="${item.label}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
        </div>
    `
      )
      .join("");
  }

  setupEventListeners() {
    // Navigation click handlers
    document.getElementById("nav-menu").addEventListener("click", (e) => {
      const navItem = e.target.closest(".nav-item");
      if (navItem) {
        const section = navItem.dataset.section;
        this.switchSection(section);
      }
    });

    // Sidebar toggle
    document.getElementById("sidebar-toggle").addEventListener("click", () => {
      this.toggleSidebar();
    });

    // Add button handler
    document.getElementById("add-button").addEventListener("click", () => {
      this.handleAddButton();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Toggle sidebar con Ctrl+B
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        this.toggleSidebar();
      }
    });

    // Setup modal event listeners
    EventBus.on("modal:input", (config) => {
      return this.showModalInput(config);
    });

    EventBus.on("modal:confirm", (config) => {
      return this.showModalConfirm(config);
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".main-content");

    if (this.sidebarCollapsed) {
      sidebar.classList.add("collapsed");
      mainContent.classList.add("sidebar-collapsed");
    } else {
      sidebar.classList.remove("collapsed");
      mainContent.classList.remove("sidebar-collapsed");
    }

    // Salva stato in localStorage
    localStorage.setItem("sidebar-collapsed", this.sidebarCollapsed);
  }

  async switchSection(sectionId) {
    const section = this.navigationItems.find((item) => item.id === sectionId);
    if (!section) return;

    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.section === sectionId);
    });

    // Update header SEMPRE, anche se non inizializzato
    document.getElementById("section-title").textContent = section.title;

    const addButton = document.getElementById("add-button");
    if (section.button) {
      addButton.textContent = section.button;
      addButton.style.display = "block";
    } else {
      addButton.style.display = "none";
    }

    this.currentSection = sectionId;

    // Render section content solo se inizializzato
    if (this.isInitialized) {
      await this.renderSection(sectionId);
    }
  }

  async renderSection(sectionId) {
    const contentBody = document.getElementById("content-body");

    try {
      const manager = this.managers[sectionId];
      if (manager && manager.render) {
        await manager.render();
      } else {
        // Default fallback for unimplemented sections
        contentBody.innerHTML = `
          <div class="empty-state">
            <h3>Sezione "${sectionId}"</h3>
            <p>Funzionalità non ancora implementata</p>
          </div>
        `;
      }
    } catch (error) {
      console.error(`Error rendering section ${sectionId}:`, error);
      this.showError(`Errore nel caricamento della sezione: ${error.message}`);
    }
  }

  handleAddButton() {
    const manager = this.managers[this.currentSection];
    if (manager && manager.openAddForm) {
      manager.openAddForm();
    } else {
      this.showNotification(
        `Funzione "Aggiungi" per ${this.currentSection} in sviluppo`,
        "warning"
      );
    }
  }

  // Modal input method for EventBus
  showModalInput(config) {
    return modalManager.showInput(config);
  }

  // Modal confirm method for EventBus
  showModalConfirm(config) {
    return modalManager.showConfirm(config);
  }

  // Notification system
  showNotification(message, type = "info", duration = 4000) {
    const notifications = document.getElementById("notifications");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notifications.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideInRight 0.3s ease-out reverse";
        setTimeout(() => {
          notification.remove();
        }, 300);
      }
    }, duration);
  }

  showError(message) {
    this.showNotification(message, "error", 6000);
  }

  // Test function for DataStore
  async testDataStore(collection) {
    try {
      console.log(`Testing DataStore for collection: ${collection}`);

      const data = dataStore.get(collection);
      console.log(`Current ${collection} data:`, data);

      // Test adding item
      const testItem = {
        name: `Test ${collection}`,
        description: "Test item created by DataStore test",
        testFlag: true,
      };

      const addedItem = await dataStore.add(collection, testItem);
      console.log("Added test item:", addedItem);

      // Test reading back
      const updatedData = dataStore.get(collection);
      console.log(`Updated ${collection} data:`, updatedData);

      // Test removing test item
      await dataStore.remove(collection, addedItem.id);
      console.log("Test item removed");

      const finalData = dataStore.get(collection);
      console.log(`Final ${collection} data:`, finalData);

      this.showNotification(
        `Test DataStore per ${collection} completato con successo!`,
        "success"
      );

      // Refresh the section to show updated count
      await this.renderSection(this.currentSection);
    } catch (error) {
      console.error(`DataStore test failed for ${collection}:`, error);
      this.showError(
        `Test DataStore fallito per ${collection}: ${error.message}`
      );
    }
  }

  // Get DataStore statistics
  getDataStats() {
    return dataStore.getStats();
  }

  /**
   * Setup context menu per le card
   */
  setupContextMenu() {
    document.addEventListener("contextmenu", (e) => {
      // Trova la card più vicina
      const card = e.target.closest(".card, .environment-card");
      if (!card) return;

      e.preventDefault();
      this.showContextMenu(e, card);
    });

    // Chiudi context menu cliccando altrove
    document.addEventListener("click", () => {
      this.hideContextMenu();
    });
  }

  /**
   * Mostra context menu
   */
  showContextMenu(event, card) {
    this.hideContextMenu();

    const contextMenu = document.createElement("div");
    contextMenu.className = "context-menu";
    contextMenu.id = "context-menu";

    let actions = [];

    if (card.dataset.characterId) {
      actions = [
        {
          label: "Visualizza",
          action: () =>
            window.characterManager.viewDetail(card.dataset.characterId),
        },
        {
          label: "Modifica",
          action: () =>
            window.characterManager.editEntity(card.dataset.characterId),
        },
        {
          label: "Elimina",
          action: () =>
            window.characterManager.deleteEntity(card.dataset.characterId),
        },
      ];
    } else if (card.dataset.npcId) {
      actions = [
        {
          label: "Visualizza",
          action: () => window.npcManager.viewDetail(card.dataset.npcId),
        },
        {
          label: "Modifica",
          action: () => window.npcManager.editEntity(card.dataset.npcId),
        },
        {
          label: "Elimina",
          action: () => window.npcManager.deleteEntity(card.dataset.npcId),
        },
      ];
    } else if (card.dataset.environmentId) {
      actions = [
        {
          label: "Visualizza",
          action: () =>
            window.environmentManager.viewDetail(card.dataset.environmentId),
        },
        {
          label: "Modifica",
          action: () =>
            window.environmentManager.editEntity(card.dataset.environmentId),
        },
        {
          label: "Elimina",
          action: () =>
            window.environmentManager.deleteEntity(card.dataset.environmentId),
        },
      ];
    }

    contextMenu.innerHTML = actions
      .map(
        (action) =>
          `<div class="context-menu-item" onclick="this.click = function(){}; (${action.action.toString()})(); window.app.hideContextMenu();">${
            action.label
          }</div>`
      )
      .join("");

    // Posiziona il menu
    contextMenu.style.left = event.pageX + "px";
    contextMenu.style.top = event.pageY + "px";

    document.body.appendChild(contextMenu);

    // Aggiusta posizione se esce dallo schermo
    const rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      contextMenu.style.left = event.pageX - rect.width + "px";
    }
    if (rect.bottom > window.innerHeight) {
      contextMenu.style.top = event.pageY - rect.height + "px";
    }
  }

  /**
   * Nascondi context menu
   */
  hideContextMenu() {
    const contextMenu = document.getElementById("context-menu");
    if (contextMenu) {
      contextMenu.remove();
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
  window.app = new DMAssistantApp();

  // Expose managers globally for onclick handlers
  window.characterManager = characterManager;
  window.npcManager = npcManager;
  window.environmentManager = environmentManager;
  window.dataStore = dataStore;

  await window.app.init();
});

// Export for global access
window.DMAssistantApp = DMAssistantApp;
