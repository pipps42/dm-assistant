/**
 * Manager Setup & Bootstrap - Configurazione completa del sistema modulare
 */
import {
  ManagerFactory,
  ManagerConfigBuilder,
  StandardComponents,
  createManagerSetup,
} from "./components/manager-factory.js";
import BaseManager from "./core/base-manager.js";

// Import manager classes
import CharacterManager from "./components/character-manager.js";
import NPCManager from "./components/npc-manager.js";
import EnvironmentManager from "./components/environment-manager.js";

// Import template modules
import * as CharacterTemplates from "./templates/character-templates.js";
import * as NPCTemplates from "./templates/npc-templates.js";
import * as EnvironmentTemplates from "./templates/environment-templates.js";

// Import component classes
import CharacterDetailModal from "./components/character-detail-modal.js";
import CharacterUtils from "./components/character-utils.js";
import NPCDetailModal from "./components/npc-detail-modal.js";
import NPCUtils from "./components/npc-utils.js";
import EnvironmentDetailView from "./components/environment-detail-view.js";
import EnvironmentUtils from "./components/environment-utils.js";

/**
 * Register all standard components
 */
function registerStandardComponents() {
  // Register reusable component types
  ManagerFactory.registerComponent(
    "BaseModalDetailHandler",
    StandardComponents.BaseModalDetailHandler
  );
  ManagerFactory.registerComponent(
    "BaseEntityUtils",
    StandardComponents.BaseEntityUtils
  );
  ManagerFactory.registerComponent(
    "BaseFormHandler",
    StandardComponents.BaseFormHandler
  );
}

/**
 * Register all manager configurations
 */
function registerManagerConfigurations() {
  // Character Manager Configuration
  createManagerSetup("characters", {
    ManagerClass: CharacterManager,
    templates: CharacterTemplates,
    UtilsClass: CharacterUtils,
    DetailHandlerClass: CharacterDetailModal,
    options: {
      hasDetailView: false, // Modal-based
      hasUtils: true,
      hasFormComponents: true,
      entityDisplayName: "Personaggio",
      pluralDisplayName: "Personaggi",
    },
  });

  // NPC Manager Configuration
  createManagerSetup("npcs", {
    ManagerClass: NPCManager,
    templates: NPCTemplates,
    UtilsClass: NPCUtils,
    DetailHandlerClass: NPCDetailModal,
    options: {
      hasDetailView: false, // Modal-based
      hasUtils: true,
      hasFormComponents: true,
      entityDisplayName: "NPC",
      pluralDisplayName: "NPCs",
    },
  });

  // Environment Manager Configuration
  createManagerSetup("environments", {
    ManagerClass: EnvironmentManager,
    templates: EnvironmentTemplates,
    UtilsClass: EnvironmentUtils,
    DetailHandlerClass: EnvironmentDetailView,
    options: {
      hasDetailView: true, // Dedicated view
      hasUtils: true,
      hasFormComponents: true,
      entityDisplayName: "Ambientazione",
      pluralDisplayName: "Ambientazioni",
    },
  });
}

/**
 * Bootstrap the manager system
 */
export function bootstrapManagerSystem() {
  console.log("🏗️ Bootstrapping manager system...");

  // Register components and configurations
  registerStandardComponents();
  registerManagerConfigurations();

  // Create all managers
  const managers = ManagerFactory.createAll();

  // Validate all managers
  Object.values(managers).forEach((manager) => {
    try {
      ManagerFactory.validateManager(manager);
      console.log(
        `✅ Manager ${manager.constructor.name} validated successfully`
      );
    } catch (error) {
      console.error(
        `❌ Manager ${manager.constructor.name} validation failed:`,
        error
      );
    }
  });

  // Expose managers globally for backwards compatibility
  window.characterManager = managers.characterManager;
  window.npcManager = managers.npcManager;
  window.environmentManager = managers.environmentManager;

  console.log("🎉 Manager system bootstrapped successfully");

  return managers;
}

/**
 * Manager Registry - Centralized access to all managers
 */
export class ManagerRegistry {
  static managers = new Map();
  static initialized = false;

  /**
   * Initialize the registry
   */
  static init(managers) {
    if (this.initialized) return;

    // Usa i manager già creati invece di ricrearli
    Object.entries(managers).forEach(([key, manager]) => {
      this.managers.set(key.replace("Manager", ""), manager);
    });

    this.initialized = true;
  }

  /**
   * Get manager by entity type
   */
  static getManager(entityType) {
    if (!this.initialized) this.init();

    const key = entityType.endsWith("s") ? entityType.slice(0, -1) : entityType;
    return this.managers.get(key);
  }

  /**
   * Get all managers
   */
  static getAllManagers() {
    if (!this.initialized) this.init();

    return Object.fromEntries(this.managers.entries());
  }

  /**
   * Execute method on all managers
   */
  static async executeOnAll(methodName, ...args) {
    const results = {};

    for (const [key, manager] of this.managers.entries()) {
      if (typeof manager[methodName] === "function") {
        try {
          results[key] = await manager[methodName](...args);
        } catch (error) {
          console.error(
            `Error executing ${methodName} on ${key} manager:`,
            error
          );
          results[key] = null;
        }
      }
    }

    return results;
  }

  /**
   * Get system-wide statistics
   */
  static getSystemStats() {
    const stats = {
      totalEntities: 0,
      managerStats: {},
      systemHealth: "good",
    };

    for (const [key, manager] of this.managers.entries()) {
      try {
        const managerStats = manager.getStats();
        stats.managerStats[key] = managerStats;
        stats.totalEntities += managerStats.total || 0;
      } catch (error) {
        console.error(`Error getting stats from ${key} manager:`, error);
        stats.systemHealth = "degraded";
        stats.managerStats[key] = { error: error.message };
      }
    }

    return stats;
  }

  /**
   * Cleanup all managers
   */
  static cleanup() {
    for (const [key, manager] of this.managers.entries()) {
      try {
        if (manager.destroy) {
          manager.destroy();
        }
      } catch (error) {
        console.error(`Error destroying ${key} manager:`, error);
      }
    }

    this.managers.clear();
    this.initialized = false;
  }
}

/**
 * Global system utilities
 */
export class SystemUtilities {
  /**
   * Search across all entity types
   */
  static async globalSearch(query) {
    const results = {};
    const managers = ManagerRegistry.getAllManagers();

    for (const [entityType, manager] of Object.entries(managers)) {
      try {
        const searchResults = manager.search(query);
        if (searchResults.length > 0) {
          results[entityType] = searchResults;
        }
      } catch (error) {
        console.error(`Error searching in ${entityType}:`, error);
      }
    }

    return results;
  }

  /**
   * Export all data
   */
  static async exportAllData(options = {}) {
    const allData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      application: "D&D Dungeon Master Assistant",
      data: {},
      statistics: {},
    };

    const managers = ManagerRegistry.getAllManagers();

    for (const [entityType, manager] of Object.entries(managers)) {
      try {
        allData.data[entityType] = manager.getAll();
        allData.statistics[entityType] = manager.getStats();
      } catch (error) {
        console.error(`Error exporting ${entityType}:`, error);
        allData.data[entityType] = [];
        allData.statistics[entityType] = { error: error.message };
      }
    }

    // Create download
    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-complete-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);

    // Show success message
    if (window.app?.showNotification) {
      window.app.showNotification("Backup completo esportato!", "success");
    }

    return allData;
  }

  /**
   * Import all data
   */
  static async importAllData(fileData) {
    try {
      const data =
        typeof fileData === "string" ? JSON.parse(fileData) : fileData;

      if (!data.data || !data.version) {
        throw new Error("Formato file non valido");
      }

      const managers = ManagerRegistry.getAllManagers();
      let importedCount = 0;

      for (const [entityType, entities] of Object.entries(data.data)) {
        const manager = managers[entityType];
        if (manager && Array.isArray(entities)) {
          try {
            // Clear existing data if requested
            // await manager.clear();

            // Import entities
            for (const entity of entities) {
              await manager.create(entity);
              importedCount++;
            }

            console.log(`✅ Imported ${entities.length} ${entityType}`);
          } catch (error) {
            console.error(`❌ Error importing ${entityType}:`, error);
          }
        }
      }

      // Refresh all views
      await ManagerRegistry.executeOnAll("render");

      if (window.app?.showNotification) {
        window.app.showNotification(
          `Importate ${importedCount} entità!`,
          "success"
        );
      }

      return { imported: importedCount };
    } catch (error) {
      console.error("Import error:", error);
      if (window.app?.showError) {
        window.app.showError("Errore durante l'importazione: " + error.message);
      }
      throw error;
    }
  }

  /**
   * System health check
   */
  static performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      checks: {},
      issues: [],
    };

    const managers = ManagerRegistry.getAllManagers();

    // Check each manager
    for (const [entityType, manager] of Object.entries(managers)) {
      const check = {
        initialized: !!manager,
        hasData: false,
        componentsLoaded: false,
        errors: [],
      };

      try {
        // Check if manager has data
        const entities = manager.getAll();
        check.hasData = Array.isArray(entities);

        // Check if components are loaded
        check.componentsLoaded = !!(manager.utils && manager.templates);

        // Check for required methods
        const requiredMethods = [
          "getAll",
          "getById",
          "create",
          "update",
          "delete",
        ];
        for (const method of requiredMethods) {
          if (typeof manager[method] !== "function") {
            check.errors.push(`Missing method: ${method}`);
          }
        }
      } catch (error) {
        check.errors.push(error.message);
        health.status = "degraded";
        health.issues.push(`${entityType}: ${error.message}`);
      }

      health.checks[entityType] = check;
    }

    // Check global state
    try {
      health.checks.dataStore = {
        initialized: !!window.dataStore?.isInitialized,
        error: null,
      };
    } catch (error) {
      health.checks.dataStore = {
        initialized: false,
        error: error.message,
      };
      health.status = "unhealthy";
      health.issues.push(`DataStore: ${error.message}`);
    }

    return health;
  }
}

/**
 * Development utilities
 */
export class DevUtilities {
  /**
   * Generate test data
   */
  static async generateTestData(options = {}) {
    const { characters = 5, npcs = 10, environments = 3 } = options;

    const managers = ManagerRegistry.getAllManagers();

    try {
      // Generate environments first
      for (let i = 0; i < environments; i++) {
        await managers.environment?.create({
          name: `Ambiente Test ${i + 1}`,
          type: ["Città", "Villaggio", "Dungeon"][i % 3],
          climate: "Temperato",
          description: `Ambiente di test generato automaticamente ${i + 1}`,
          dangers: ["Mostri", "Trappole"],
          resources: ["Taverna", "Negozio"],
          maps: [],
        });
      }

      // Generate characters
      for (let i = 0; i < characters; i++) {
        await managers.character?.create({
          name: `Personaggio Test ${i + 1}`,
          playerName: `Giocatore ${i + 1}`,
          race: "Umano",
          class: "Guerriero",
          level: Math.floor(Math.random() * 5) + 1,
          alignment: "Neutrale Buono",
          hitPoints: Math.floor(Math.random() * 50) + 20,
          background: "Background di test",
          adventures: [],
          notes: [],
        });
      }

      // Generate NPCs
      const envIds = managers.environment?.getAll().map((env) => env.id) || [];
      for (let i = 0; i < npcs; i++) {
        await managers.npc?.create({
          name: `NPC Test ${i + 1}`,
          race: "Umano",
          profession: "Mercante",
          alignment: "Neutrale Puro",
          attitude: "Amichevole",
          environmentId: envIds[i % envIds.length] || null,
          description: "NPC di test generato automaticamente",
          interactions: [],
          relationships: [],
          quests: [],
        });
      }

      console.log(
        `✅ Generated test data: ${characters} characters, ${npcs} NPCs, ${environments} environments`
      );

      if (window.app?.showNotification) {
        window.app.showNotification("Dati di test generati!", "success");
      }
    } catch (error) {
      console.error("Error generating test data:", error);
      if (window.app?.showError) {
        window.app.showError(
          "Errore nella generazione dati di test: " + error.message
        );
      }
    }
  }

  /**
   * Clear all data (development only)
   */
  static async clearAllData() {
    if (process.env.NODE_ENV !== "development") {
      console.warn("clearAllData is only available in development mode");
      return;
    }

    const confirmed = confirm(
      "⚠️ ATTENZIONE: Eliminare TUTTI i dati? Questa azione non può essere annullata!"
    );
    if (!confirmed) return;

    const managers = ManagerRegistry.getAllManagers();

    for (const [entityType, manager] of Object.entries(managers)) {
      try {
        const entities = manager.getAll();
        for (const entity of entities) {
          await manager.delete(entity.id);
        }
        console.log(`🗑️ Cleared all ${entityType}`);
      } catch (error) {
        console.error(`Error clearing ${entityType}:`, error);
      }
    }

    if (window.app?.showNotification) {
      window.app.showNotification("Tutti i dati eliminati!", "info");
    }
  }
}

// Expose utilities globally for console access
if (typeof window !== "undefined") {
  window.ManagerRegistry = ManagerRegistry;
  window.SystemUtilities = SystemUtilities;
  window.DevUtilities = DevUtilities;
}

export default {
  bootstrapManagerSystem,
  ManagerRegistry,
  SystemUtilities,
  DevUtilities,
};
