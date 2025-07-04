/**
 * Environment Manager - Versione semplice che estende BaseManager
 * Gestisce solo le specificità delle ambientazioni
 */
import BaseManager from "../core/base-manager.js";
import * as EnvironmentTemplates from "../templates/environment-templates.js";
import ImageUpload from "../ui/image-upload.js";
import modalManager from "../ui/modal-manager.js";

class EnvironmentManager extends BaseManager {
  constructor() {
    super("environments", EnvironmentTemplates);
    this.imageUpload = null;
  }

  /**
   * Process form data specifico per le ambientazioni
   */
  processFormData(data) {
    // Get image from image upload
    if (this.imageUpload) {
      data.image = this.imageUpload.getValue();
    }

    // Parse dangers (comma-separated)
    if (data.dangers && typeof data.dangers === "string") {
      data.dangers = data.dangers
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d);
    }

    // Parse resources (newline-separated)
    if (data.resources && typeof data.resources === "string") {
      data.resources = data.resources
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r);
    }

    // Trim text fields
    ["name", "description", "conditions", "currency", "lodgingCost"].forEach(
      (field) => {
        if (data[field]) data[field] = data[field].trim();
      }
    );

    // Ensure maps array exists
    if (!data.maps) data.maps = [];
  }

  /**
   * Setup componenti specifici del form Environment
   */
  setupFormComponents(entity, mode) {
    // Setup image upload
    const uploadContainer = document.getElementById("environment-image-upload");
    if (uploadContainer) {
      this.imageUpload = new ImageUpload(uploadContainer, {
        type: "cover",
        allowEmoji: true,
        defaultEmoji: "🏰",
        name: "image",
      });

      if (entity?.image) {
        this.imageUpload.setValue(entity.image);
      }
    }
  }

  /**
   * Gestisce azioni specifiche del detail Environment
   */
  async handleDetailAction(action, entity, button) {
    switch (action) {
      case "add-map":
        await this.addMap(entity);
        break;

      case "remove-map":
        const mapId = button.dataset.mapId;
        await this.removeMap(entity, mapId);
        break;

      case "add-npc":
        // Delegate to NPC manager
        const npcManager = window.npcManager;
        if (npcManager) {
          modalManager.close();
          setTimeout(() => npcManager.openFormWithEnvironment(entity.id), 100);
        }
        break;

      case "view-npc":
        const npcId = button.dataset.npcId;
        const npcManager2 = window.npcManager;
        if (npcManager2) {
          modalManager.close();
          setTimeout(() => npcManager2.openDetail(npcId), 100);
        }
        break;
    }
  }

  /**
   * Aggiungi mappa all'ambiente
   */
  async addMap(environment) {
    const mapName = await modalManager.input({
      title: "Aggiungi Mappa",
      label: "Nome della mappa:",
      placeholder: "Es. Primo piano, Cantina, Esterno...",
      inputType: "text",
    });

    if (!mapName?.trim()) return;

    const mapDescription = await modalManager.input({
      title: "Descrizione Mappa",
      label: "Descrizione (opzionale):",
      placeholder: "Descrivi la mappa...",
      inputType: "textarea",
    });

    // Add map to environment
    const newMap = {
      id: Date.now(),
      name: mapName.trim(),
      description: mapDescription?.trim() || "",
      gridSize: 30,
      createdAt: new Date().toISOString(),
    };

    if (!environment.maps) environment.maps = [];
    environment.maps.push(newMap);

    await this.update(environment.id, environment);

    // Riapri il detail aggiornato
    setTimeout(() => this.openDetail(environment.id), 100);
    this.showSuccess("Mappa aggiunta!");
  }

  /**
   * Rimuovi mappa dall'ambiente
   */
  async removeMap(environment, mapId) {
    const confirmed = await modalManager.confirm({
      title: "Rimuovi Mappa",
      message: "Sei sicuro di voler rimuovere questa mappa?",
    });

    if (!confirmed) return;

    // Remove map
    if (environment.maps) {
      environment.maps = environment.maps.filter((map) => map.id != mapId);
    }

    await this.update(environment.id, environment);

    // Riapri il detail aggiornato
    setTimeout(() => this.openDetail(environment.id), 100);
    this.showSuccess("Mappa rimossa!");
  }

  /**
   * Get NPCs in environment
   */
  getNPCsInEnvironment(environmentId) {
    const npcManager = window.npcManager;
    return npcManager ? npcManager.getNPCsByEnvironment(environmentId) : [];
  }

  /**
   * Get environments for selection
   */
  getEnvironmentsForSelection() {
    return this.getAll().map((env) => ({
      id: env.id,
      name: env.name,
      type: env.type,
      image: env.image,
    }));
  }

  /**
   * Generate selection options HTML
   */
  generateSelectionList() {
    return this.getAll()
      .map(
        (env) =>
          this.templates.generateSelectionOption?.(env) ||
          `
        <option value="${env.id}">${env.name}</option>
      `
      )
      .join("");
  }

  /**
   * Override renderCard to use environment template
   */
  renderCard(environment) {
    return this.templates.generateCard(environment);
  }

  /**
   * Export environments data
   */
  exportEnvironments() {
    const environments = this.getAll();
    const exportData = {
      environments,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dnd-environments-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showSuccess("Ambientazioni esportate!");
  }

  /**
   * Get environment statistics
   */
  getEnvironmentStats() {
    const environments = this.getAll();

    const stats = {
      total: environments.length,
      byType: {},
      byClimate: {},
      totalMaps: 0,
      totalNPCs: 0,
    };

    environments.forEach((env) => {
      // Count by type
      if (env.type) {
        stats.byType[env.type] = (stats.byType[env.type] || 0) + 1;
      }

      // Count by climate
      if (env.climate) {
        stats.byClimate[env.climate] = (stats.byClimate[env.climate] || 0) + 1;
      }

      // Count maps
      stats.totalMaps += env.maps ? env.maps.length : 0;

      // Count NPCs
      stats.totalNPCs += this.getNPCsInEnvironment(env.id).length;
    });

    return stats;
  }

  /**
   * Search environments by name or type
   */
  searchEnvironments(query) {
    const searchTerm = query.toLowerCase();
    return this.getAll().filter(
      (env) =>
        env.name.toLowerCase().includes(searchTerm) ||
        (env.type && env.type.toLowerCase().includes(searchTerm)) ||
        (env.description && env.description.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get environments by type
   */
  getEnvironmentsByType(type) {
    return this.getAll().filter((env) => env.type === type);
  }

  /**
   * Cleanup quando necessario
   */
  cleanup() {
    if (this.imageUpload) {
      this.imageUpload.destroy();
      this.imageUpload = null;
    }
  }
}

// Singleton
const environmentManager = new EnvironmentManager();
export default environmentManager;
